import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Convert time string "HH:MM" to minutes from midnight
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if two time ranges overlap
 */
function timeOverlaps(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Overlap exists if one range starts before the other ends
  return s1 < e2 && s2 < e1;
}

/**
 * Check if instructor has a scheduling conflict
 * @param {string} instructorId - The instructor's ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @param {string} startTime - Start time "HH:MM"
 * @param {string} endTime - End time "HH:MM"
 * @param {string} excludeClassId - Class ID to exclude (for updates)
 * @returns {Promise<{hasConflict: boolean, conflictingClass?: string}>}
 */
export async function checkInstructorConflict(instructorId, dayOfWeek, startTime, endTime, excludeClassId = null) {
  if (!instructorId) {
    return { hasConflict: false };
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      dayOfWeek,
      class: {
        instructorId,
        ...(excludeClassId && { id: { not: excludeClassId } })
      }
    },
    include: {
      class: {
        select: { id: true, name: true }
      }
    }
  });

  for (const schedule of schedules) {
    if (timeOverlaps(startTime, endTime, schedule.startTime, schedule.endTime)) {
      return {
        hasConflict: true,
        conflictingClass: schedule.class.name,
        conflictingClassId: schedule.class.id,
        conflictingTime: `${schedule.startTime} - ${schedule.endTime}`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Check if saloon has a scheduling conflict
 * @param {string} saloonId - The saloon's ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @param {string} startTime - Start time "HH:MM"
 * @param {string} endTime - End time "HH:MM"
 * @param {string} excludeScheduleId - Schedule ID to exclude (for updates)
 * @returns {Promise<{hasConflict: boolean, conflictingClass?: string}>}
 */
export async function checkSaloonConflict(saloonId, dayOfWeek, startTime, endTime, excludeScheduleId = null) {
  if (!saloonId) {
    return { hasConflict: false };
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      saloonId,
      dayOfWeek,
      ...(excludeScheduleId && { id: { not: excludeScheduleId } })
    },
    include: {
      class: {
        select: { id: true, name: true }
      }
    }
  });

  for (const schedule of schedules) {
    if (timeOverlaps(startTime, endTime, schedule.startTime, schedule.endTime)) {
      return {
        hasConflict: true,
        conflictingClass: schedule.class.name,
        conflictingClassId: schedule.class.id,
        conflictingTime: `${schedule.startTime} - ${schedule.endTime}`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Validate all schedules for a class
 * @param {Array} schedules - Array of schedule objects {dayOfWeek, startTime, endTime, saloonId}
 * @param {string} instructorId - The instructor's ID
 * @param {string} excludeClassId - Class ID to exclude (for updates)
 * @returns {Promise<{valid: boolean, errors: Array}>}
 */
export async function validateSchedules(schedules, instructorId, excludeClassId = null) {
  const errors = [];

  for (let i = 0; i < schedules.length; i++) {
    const schedule = schedules[i];
    const { dayOfWeek, startTime, endTime, saloonId } = schedule;

    // Check instructor conflict
    const instructorConflict = await checkInstructorConflict(
      instructorId,
      dayOfWeek,
      startTime,
      endTime,
      excludeClassId
    );

    if (instructorConflict.hasConflict) {
      errors.push({
        type: 'instructor',
        scheduleIndex: i,
        message: `Instructor is already teaching "${instructorConflict.conflictingClass}" at ${instructorConflict.conflictingTime}`,
        conflictingClass: instructorConflict.conflictingClass
      });
    }

    // Check saloon conflict
    if (saloonId) {
      const saloonConflict = await checkSaloonConflict(
        saloonId,
        dayOfWeek,
        startTime,
        endTime,
        null // We use classId exclusion through the query, not scheduleId
      );

      if (saloonConflict.hasConflict && saloonConflict.conflictingClassId !== excludeClassId) {
        errors.push({
          type: 'saloon',
          scheduleIndex: i,
          message: `Saloon is already booked for "${saloonConflict.conflictingClass}" at ${saloonConflict.conflictingTime}`,
          conflictingClass: saloonConflict.conflictingClass
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  checkInstructorConflict,
  checkSaloonConflict,
  validateSchedules,
  timeOverlaps,
  timeToMinutes
};

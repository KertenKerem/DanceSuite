import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateSchedules, checkInstructorConflict, checkSaloonConflict } from '../utils/scheduleValidator.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const { branchId } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = branchId;
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        schedules: {
          include: {
            saloon: {
              select: { id: true, name: true }
            }
          }
        },
        branch: {
          select: { id: true, name: true }
        },
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });
    res.json(classes);
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get single class
router.get('/:id', async (req, res) => {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        schedules: true,
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Validate schedule conflicts
router.post('/validate-schedule', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { schedules, instructorId, classId } = req.body;

    const validation = await validateSchedules(schedules, instructorId, classId);
    res.json(validation);
  } catch (error) {
    console.error('Failed to validate schedule:', error);
    res.status(500).json({ error: 'Failed to validate schedule' });
  }
});

// Create class (Admin/Instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { name, description, maxCapacity, schedules, instructorId, recurrence, branchId, fee } = req.body;

    const finalInstructorId = instructorId || req.user.userId;

    // Validate schedule conflicts
    if (schedules && schedules.length > 0) {
      const validation = await validateSchedules(schedules, finalInstructorId, null);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Scheduling conflict detected',
          conflicts: validation.errors
        });
      }
    }

    const classData = await prisma.class.create({
      data: {
        name,
        description,
        maxCapacity,
        fee,
        recurrence: recurrence || 'WEEKLY',
        instructorId: finalInstructorId,
        branchId,
        schedules: {
          create: (schedules || []).map(s => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            saloonId: s.saloonId || null
          }))
        }
      },
      include: {
        schedules: {
          include: {
            saloon: { select: { id: true, name: true } }
          }
        },
        branch: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(classData);
  } catch (error) {
    console.error('Failed to create class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Update class (Admin/Instructor only)
router.put('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { name, description, maxCapacity, instructorId, schedules, recurrence, branchId, fee } = req.body;

    // Validate schedule conflicts if schedules are being updated
    if (schedules && schedules.length > 0) {
      const validation = await validateSchedules(schedules, instructorId, req.params.id);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Scheduling conflict detected',
          conflicts: validation.errors
        });
      }
    }

    // Delete existing schedules and recreate them
    if (schedules) {
      await prisma.schedule.deleteMany({
        where: { classId: req.params.id }
      });
    }

    const classData = await prisma.class.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        maxCapacity,
        instructorId,
        recurrence,
        branchId,
        fee,
        ...(schedules && {
          schedules: {
            create: schedules.map(s => ({
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              saloonId: s.saloonId || null
            }))
          }
        })
      },
      include: {
        schedules: {
          include: {
            saloon: { select: { id: true, name: true } }
          }
        },
        branch: { select: { id: true, name: true } }
      }
    });

    res.json(classData);
  } catch (error) {
    console.error('Failed to update class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Delete class (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.class.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

export default router;

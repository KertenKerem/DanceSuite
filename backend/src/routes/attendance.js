import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get attendance for a class on a specific date
router.get('/class/:classId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const whereClause = {
      enrollment: {
        classId
      }
    };

    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.date = {
        gte: queryDate,
        lt: nextDay
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        enrollment: {
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
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ error: 'Failed to get attendance' });
  }
});

// Get student's attendance history
router.get('/student/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Students can only view their own attendance
    if (req.user.role === 'STUDENT' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        enrollment: {
          userId
        }
      },
      include: {
        enrollment: {
          include: {
            class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Failed to get attendance history' });
  }
});

// Mark attendance
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { enrollmentId, date, status, notes } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        enrollmentId_date: {
          enrollmentId,
          date: attendanceDate
        }
      },
      update: {
        status,
        notes
      },
      create: {
        enrollmentId,
        date: attendanceDate,
        status,
        notes
      },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Update attendance
router.put('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        notes
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Get filtered attendance report (Admin and Instructor)
router.get('/report/filtered', authenticate, authorize('ADMIN', 'INSTRUCTOR', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { startDate, endDate, instructorId, studentId, classId, status } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    // Build where clause for enrollment
    const enrollmentWhere = {};
    if (studentId) enrollmentWhere.userId = studentId;
    if (classId) enrollmentWhere.classId = classId;

    // For office workers, filter by their branch
    if (req.user.role === 'OFFICE_WORKER') {
      const officeWorker = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { branchId: true }
      });

      if (!officeWorker?.branchId) {
        return res.status(403).json({ error: 'Office worker must be assigned to a branch' });
      }

      enrollmentWhere.class = { branchId: officeWorker.branchId };
    } else if (instructorId) {
      enrollmentWhere.class = { instructorId };
    }

    // Build attendance where clause
    const attendanceWhere = {
      ...(Object.keys(dateFilter).length && { date: dateFilter }),
      ...(status && { status }),
      enrollment: enrollmentWhere
    };

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            class: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                branch: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const statusCounts = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0
    };

    const classSummary = {};
    const studentSummary = {};
    const instructorSummary = {};

    attendanceRecords.forEach(record => {
      // Count by status
      statusCounts[record.status]++;

      // Class summary
      const classId = record.enrollment.class.id;
      if (!classSummary[classId]) {
        classSummary[classId] = {
          id: classId,
          name: record.enrollment.class.name,
          instructor: `${record.enrollment.class.instructor.firstName} ${record.enrollment.class.instructor.lastName}`,
          branch: record.enrollment.class.branch.name,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      classSummary[classId].total++;
      classSummary[classId][record.status.toLowerCase()]++;

      // Student summary
      const studentId = record.enrollment.user.id;
      if (!studentSummary[studentId]) {
        studentSummary[studentId] = {
          id: studentId,
          name: `${record.enrollment.user.firstName} ${record.enrollment.user.lastName}`,
          email: record.enrollment.user.email,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      studentSummary[studentId].total++;
      studentSummary[studentId][record.status.toLowerCase()]++;

      // Instructor summary
      const instructorId = record.enrollment.class.instructor.id;
      if (!instructorSummary[instructorId]) {
        instructorSummary[instructorId] = {
          id: instructorId,
          name: `${record.enrollment.class.instructor.firstName} ${record.enrollment.class.instructor.lastName}`,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      instructorSummary[instructorId].total++;
      instructorSummary[instructorId][record.status.toLowerCase()]++;
    });

    // Calculate attendance rates
    Object.values(classSummary).forEach(cls => {
      cls.attendanceRate = cls.total > 0 ? ((cls.present + cls.late) / cls.total * 100).toFixed(1) : 0;
    });

    Object.values(studentSummary).forEach(student => {
      student.attendanceRate = student.total > 0 ? ((student.present + student.late) / student.total * 100).toFixed(1) : 0;
    });

    Object.values(instructorSummary).forEach(instructor => {
      instructor.attendanceRate = instructor.total > 0 ? ((instructor.present + instructor.late) / instructor.total * 100).toFixed(1) : 0;
    });

    res.json({
      summary: {
        totalRecords,
        statusCounts,
        attendanceRate: totalRecords > 0 ? ((statusCounts.PRESENT + statusCounts.LATE) / totalRecords * 100).toFixed(1) : 0
      },
      records: attendanceRecords.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status,
        notes: record.notes,
        student: {
          id: record.enrollment.user.id,
          name: `${record.enrollment.user.firstName} ${record.enrollment.user.lastName}`,
          email: record.enrollment.user.email
        },
        class: {
          id: record.enrollment.class.id,
          name: record.enrollment.class.name,
          instructor: `${record.enrollment.class.instructor.firstName} ${record.enrollment.class.instructor.lastName}`,
          branch: record.enrollment.class.branch.name
        }
      })),
      classSummary: Object.values(classSummary),
      studentSummary: Object.values(studentSummary),
      instructorSummary: Object.values(instructorSummary)
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ error: 'Failed to fetch attendance report' });
  }
});

export default router;

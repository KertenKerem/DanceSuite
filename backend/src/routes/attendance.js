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

export default router;

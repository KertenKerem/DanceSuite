import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get weekly calendar data for a branch
router.get('/weekly', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { branchId } = req.query;

    // Get branch with operating hours
    let branch = null;
    let saloons = [];

    if (branchId) {
      branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: {
          saloons: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          }
        }
      });

      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }

      saloons = branch.saloons;
    } else {
      // Get all active saloons from all branches
      saloons = await prisma.saloon.findMany({
        where: { isActive: true },
        include: {
          branch: {
            select: { id: true, name: true, operatingStart: true, operatingEnd: true }
          }
        },
        orderBy: [
          { branch: { name: 'asc' } },
          { name: 'asc' }
        ]
      });
    }

    // Get all schedules for these saloons
    const saloonIds = saloons.map(s => s.id);

    const schedules = await prisma.schedule.findMany({
      where: {
        saloonId: { in: saloonIds }
      },
      include: {
        class: {
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true }
            },
            branch: {
              select: { id: true, name: true }
            },
            _count: {
              select: { enrollments: true }
            }
          }
        },
        saloon: {
          select: { id: true, name: true }
        }
      }
    });

    // Also get schedules without saloon assignment (for backward compatibility)
    const unassignedSchedules = await prisma.schedule.findMany({
      where: {
        saloonId: null,
        class: branchId ? { branchId } : {}
      },
      include: {
        class: {
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true }
            },
            branch: {
              select: { id: true, name: true }
            },
            _count: {
              select: { enrollments: true }
            }
          }
        }
      }
    });

    // Organize by day of week and saloon
    const calendarData = {
      branch: branch ? {
        id: branch.id,
        name: branch.name,
        operatingStart: branch.operatingStart,
        operatingEnd: branch.operatingEnd
      } : null,
      saloons: saloons.map(s => ({
        id: s.id,
        name: s.name,
        capacity: s.capacity,
        branchName: s.branch?.name
      })),
      schedules: schedules.map(s => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        saloonId: s.saloonId,
        saloonName: s.saloon?.name,
        class: {
          id: s.class.id,
          name: s.class.name,
          fee: s.class.fee,
          recurrence: s.class.recurrence,
          instructorName: s.class.instructor
            ? `${s.class.instructor.firstName} ${s.class.instructor.lastName}`
            : null,
          enrollmentCount: s.class._count.enrollments,
          branchName: s.class.branch?.name
        }
      })),
      unassignedSchedules: unassignedSchedules.map(s => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        class: {
          id: s.class.id,
          name: s.class.name,
          fee: s.class.fee,
          recurrence: s.class.recurrence,
          instructorName: s.class.instructor
            ? `${s.class.instructor.firstName} ${s.class.instructor.lastName}`
            : null,
          enrollmentCount: s.class._count.enrollments,
          branchName: s.class.branch?.name
        }
      })),
      operatingHours: {
        start: branch?.operatingStart || '09:00',
        end: branch?.operatingEnd || '23:00'
      }
    };

    res.json(calendarData);
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

// Get calendar for specific branch
router.get('/weekly/:branchId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.branchId },
      include: {
        saloons: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const saloonIds = branch.saloons.map(s => s.id);

    const schedules = await prisma.schedule.findMany({
      where: {
        OR: [
          { saloonId: { in: saloonIds } },
          { saloonId: null, class: { branchId: req.params.branchId } }
        ]
      },
      include: {
        class: {
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true }
            },
            _count: {
              select: { enrollments: true }
            }
          }
        },
        saloon: {
          select: { id: true, name: true }
        }
      }
    });

    const calendarData = {
      branch: {
        id: branch.id,
        name: branch.name,
        operatingStart: branch.operatingStart,
        operatingEnd: branch.operatingEnd
      },
      saloons: branch.saloons.map(s => ({
        id: s.id,
        name: s.name,
        capacity: s.capacity
      })),
      schedules: schedules.map(s => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        saloonId: s.saloonId,
        saloonName: s.saloon?.name,
        class: {
          id: s.class.id,
          name: s.class.name,
          fee: s.class.fee,
          recurrence: s.class.recurrence,
          instructorName: s.class.instructor
            ? `${s.class.instructor.firstName} ${s.class.instructor.lastName}`
            : null,
          enrollmentCount: s.class._count.enrollments
        }
      })),
      operatingHours: {
        start: branch.operatingStart,
        end: branch.operatingEnd
      }
    };

    res.json(calendarData);
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

export default router;

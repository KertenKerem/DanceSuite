import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all instructor payment configs
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const configs = await prisma.instructorPaymentConfig.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    res.json(configs);
  } catch (error) {
    console.error('Failed to fetch instructor payment configs:', error);
    res.status(500).json({ error: 'Failed to fetch instructor payment configs' });
  }
});

// Get payment config for specific instructor
router.get('/:instructorId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const config = await prisma.instructorPaymentConfig.findUnique({
      where: { instructorId: req.params.instructorId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!config) {
      return res.status(404).json({ error: 'Payment config not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Failed to fetch payment config:', error);
    res.status(500).json({ error: 'Failed to fetch payment config' });
  }
});

// Create or update payment config (upsert)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { instructorId, paymentType, monthlySalary, perLessonRate, percentageRate } = req.body;

    // Verify instructor exists and is an instructor
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    if (instructor.role !== 'INSTRUCTOR') {
      return res.status(400).json({ error: 'User is not an instructor' });
    }

    const config = await prisma.instructorPaymentConfig.upsert({
      where: { instructorId },
      update: {
        paymentType,
        monthlySalary: paymentType === 'MONTHLY_SALARY' ? monthlySalary : null,
        perLessonRate: paymentType === 'PER_LESSON' ? perLessonRate : null,
        percentageRate: paymentType === 'PERCENTAGE' ? percentageRate : null
      },
      create: {
        instructorId,
        paymentType,
        monthlySalary: paymentType === 'MONTHLY_SALARY' ? monthlySalary : null,
        perLessonRate: paymentType === 'PER_LESSON' ? perLessonRate : null,
        percentageRate: paymentType === 'PERCENTAGE' ? percentageRate : null
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(config);
  } catch (error) {
    console.error('Failed to create/update payment config:', error);
    res.status(500).json({ error: 'Failed to create/update payment config' });
  }
});

// Update payment config
router.put('/:instructorId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { paymentType, monthlySalary, perLessonRate, percentageRate } = req.body;

    const config = await prisma.instructorPaymentConfig.update({
      where: { instructorId: req.params.instructorId },
      data: {
        paymentType,
        monthlySalary: paymentType === 'MONTHLY_SALARY' ? monthlySalary : null,
        perLessonRate: paymentType === 'PER_LESSON' ? perLessonRate : null,
        percentageRate: paymentType === 'PERCENTAGE' ? percentageRate : null
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Failed to update payment config:', error);
    res.status(500).json({ error: 'Failed to update payment config' });
  }
});

// Delete payment config (reset to default)
router.delete('/:instructorId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.instructorPaymentConfig.delete({
      where: { instructorId: req.params.instructorId }
    });
    res.json({ message: 'Payment config deleted successfully' });
  } catch (error) {
    console.error('Failed to delete payment config:', error);
    res.status(500).json({ error: 'Failed to delete payment config' });
  }
});

// Calculate payment for instructor in date range
router.get('/calculate/:instructorId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const instructorId = req.params.instructorId;

    const config = await prisma.instructorPaymentConfig.findUnique({
      where: { instructorId },
      include: {
        instructor: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    if (!config) {
      return res.status(404).json({ error: 'Payment config not found for this instructor' });
    }

    let calculatedAmount = 0;
    let details = {};

    if (config.paymentType === 'MONTHLY_SALARY') {
      calculatedAmount = config.monthlySalary || 0;
      details = { type: 'monthly', amount: config.monthlySalary };
    } else if (config.paymentType === 'PER_LESSON') {
      // Count lessons taught in the date range
      const lessonsCount = await prisma.attendance.count({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          enrollment: {
            class: {
              instructorId
            }
          }
        }
      });

      // Count unique dates (each date = one lesson)
      const uniqueDates = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          enrollment: {
            class: {
              instructorId
            }
          }
        },
        distinct: ['date']
      });

      const lessonCount = uniqueDates.length;
      calculatedAmount = lessonCount * (config.perLessonRate || 0);
      details = { type: 'perLesson', rate: config.perLessonRate, lessonCount, amount: calculatedAmount };
    } else if (config.paymentType === 'PERCENTAGE') {
      // Calculate based on class fees collected
      const classes = await prisma.class.findMany({
        where: { instructorId },
        select: { fee: true, enrollments: { where: { status: 'ACTIVE' } } }
      });

      let totalFees = 0;
      classes.forEach(c => {
        if (c.fee) {
          totalFees += c.fee * c.enrollments.length;
        }
      });

      calculatedAmount = totalFees * ((config.percentageRate || 0) / 100);
      details = { type: 'percentage', rate: config.percentageRate, totalFees, amount: calculatedAmount };
    }

    res.json({
      instructor: config.instructor,
      paymentType: config.paymentType,
      calculatedAmount,
      details,
      period: { startDate, endDate }
    });
  } catch (error) {
    console.error('Failed to calculate payment:', error);
    res.status(500).json({ error: 'Failed to calculate payment' });
  }
});

export default router;

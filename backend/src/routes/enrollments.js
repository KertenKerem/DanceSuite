import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's enrollments
router.get('/my-enrollments', authenticate, async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      include: {
        class: {
          include: {
            schedules: true
          }
        }
      }
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Enroll in a class
router.post('/', authenticate, async (req, res) => {
  try {
    const { classId } = req.body;

    // Check if class exists and has capacity
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData._count.enrollments >= classData.maxCapacity) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId: req.user.userId,
          classId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this class' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.userId,
        classId
      },
      include: {
        class: true
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll in class' });
  }
});

// Cancel enrollment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: req.params.id }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.enrollment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel enrollment' });
  }
});

export default router;

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        schedules: true,
        _count: {
          select: { enrollments: true }
        }
      }
    });
    res.json(classes);
  } catch (error) {
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

// Create class (Admin/Instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { name, description, maxCapacity, schedules } = req.body;

    const classData = await prisma.class.create({
      data: {
        name,
        description,
        maxCapacity,
        instructorId: req.user.userId,
        schedules: {
          create: schedules || []
        }
      },
      include: {
        schedules: true
      }
    });

    res.status(201).json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Update class (Admin/Instructor only)
router.put('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { name, description, maxCapacity } = req.body;

    const classData = await prisma.class.update({
      where: { id: req.params.id },
      data: { name, description, maxCapacity }
    });

    res.json(classData);
  } catch (error) {
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

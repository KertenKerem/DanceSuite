import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all branches
router.get('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        saloons: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { classes: true, saloons: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(branches);
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Get single branch with saloons
router.get('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: {
        saloons: {
          orderBy: { name: 'asc' }
        },
        classes: {
          include: {
            schedules: true,
            instructor: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    console.error('Failed to fetch branch:', error);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
});

// Create branch (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, address, phone, operatingStart, operatingEnd } = req.body;

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        phone,
        operatingStart: operatingStart || '09:00',
        operatingEnd: operatingEnd || '23:00'
      },
      include: {
        saloons: true
      }
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error('Failed to create branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

// Update branch (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, address, phone, isActive, operatingStart, operatingEnd } = req.body;

    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: {
        name,
        address,
        phone,
        isActive,
        operatingStart,
        operatingEnd
      },
      include: {
        saloons: true
      }
    });

    res.json(branch);
  } catch (error) {
    console.error('Failed to update branch:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
});

// Delete branch (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.branch.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Failed to delete branch:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

export default router;

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all saloons (with optional branch filter)
router.get('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { branchId } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = branchId;
    }

    const saloons = await prisma.saloon.findMany({
      where,
      include: {
        branch: {
          select: { id: true, name: true }
        },
        _count: {
          select: { schedules: true }
        }
      },
      orderBy: [
        { branch: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
    res.json(saloons);
  } catch (error) {
    console.error('Failed to fetch saloons:', error);
    res.status(500).json({ error: 'Failed to fetch saloons' });
  }
});

// Get saloons by branch
router.get('/branch/:branchId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const saloons = await prisma.saloon.findMany({
      where: {
        branchId: req.params.branchId,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(saloons);
  } catch (error) {
    console.error('Failed to fetch saloons:', error);
    res.status(500).json({ error: 'Failed to fetch saloons' });
  }
});

// Get single saloon
router.get('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const saloon = await prisma.saloon.findUnique({
      where: { id: req.params.id },
      include: {
        branch: true,
        schedules: {
          include: {
            class: {
              include: {
                instructor: {
                  select: { id: true, firstName: true, lastName: true }
                }
              }
            }
          }
        }
      }
    });

    if (!saloon) {
      return res.status(404).json({ error: 'Saloon not found' });
    }

    res.json(saloon);
  } catch (error) {
    console.error('Failed to fetch saloon:', error);
    res.status(500).json({ error: 'Failed to fetch saloon' });
  }
});

// Create saloon (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { branchId, name, capacity } = req.body;

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const saloon = await prisma.saloon.create({
      data: {
        branchId,
        name,
        capacity
      },
      include: {
        branch: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(saloon);
  } catch (error) {
    console.error('Failed to create saloon:', error);
    res.status(500).json({ error: 'Failed to create saloon' });
  }
});

// Update saloon (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, capacity, isActive } = req.body;

    const saloon = await prisma.saloon.update({
      where: { id: req.params.id },
      data: {
        name,
        capacity,
        isActive
      },
      include: {
        branch: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(saloon);
  } catch (error) {
    console.error('Failed to update saloon:', error);
    res.status(500).json({ error: 'Failed to update saloon' });
  }
});

// Delete saloon (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.saloon.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Saloon deleted successfully' });
  } catch (error) {
    console.error('Failed to delete saloon:', error);
    res.status(500).json({ error: 'Failed to delete saloon' });
  }
});

export default router;

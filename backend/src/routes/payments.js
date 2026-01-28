import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's payments
router.get('/my-payments', authenticate, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all payments (Admin and Office Worker)
router.get('/', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const where = {};

    // Office workers can only see payments from their branch students
    if (req.user.role === 'OFFICE_WORKER') {
      const officeWorker = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { branchId: true }
      });

      if (!officeWorker?.branchId) {
        return res.status(403).json({ error: 'Office worker must be assigned to a branch' });
      }

      where.user = {
        enrollments: {
          some: {
            class: {
              branchId: officeWorker.branchId
            }
          }
        }
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment (Admin and Office Worker)
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    // Office workers can only create payments for students in their branch
    if (req.user.role === 'OFFICE_WORKER') {
      const officeWorker = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { branchId: true }
      });

      if (!officeWorker?.branchId) {
        return res.status(403).json({ error: 'Office worker must be assigned to a branch' });
      }

      // Verify the student has enrollments in the office worker's branch
      const student = await prisma.user.findFirst({
        where: {
          id: userId,
          enrollments: {
            some: {
              class: {
                branchId: officeWorker.branchId
              }
            }
          }
        }
      });

      if (!student) {
        return res.status(403).json({ error: 'Student not found in your branch' });
      }
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        description,
        status: 'PENDING'
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment status (Admin and Office Worker)
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { status, paymentDate } = req.body;

    // Office workers can only update payments from their branch students
    if (req.user.role === 'OFFICE_WORKER') {
      const officeWorker = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { branchId: true }
      });

      if (!officeWorker?.branchId) {
        return res.status(403).json({ error: 'Office worker must be assigned to a branch' });
      }

      // Verify the payment belongs to a student in the office worker's branch
      const payment = await prisma.payment.findFirst({
        where: {
          id: req.params.id,
          user: {
            enrollments: {
              some: {
                class: {
                  branchId: officeWorker.branchId
                }
              }
            }
          }
        }
      });

      if (!payment) {
        return res.status(403).json({ error: 'Payment not found in your branch' });
      }
    }

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status,
        paymentDate: status === 'COMPLETED' ? new Date() : paymentDate
      }
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

export default router;

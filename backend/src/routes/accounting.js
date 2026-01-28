import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all expenses (Admin and Office Worker)
router.get('/expenses', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense (Admin and Office Worker)
router.post('/expenses', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { category, amount, description, date, vendor, receipt } = req.body;
    const expense = await prisma.expense.create({
      data: {
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        vendor,
        receipt
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense (Admin only)
router.put('/expenses/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { category, amount, description, date, vendor, receipt } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        vendor,
        receipt
      }
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense (Admin only)
router.delete('/expenses/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get financial summary (Admin and Office Worker)
router.get('/summary', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    // For office workers, filter by their branch
    let branchFilter = {};
    if (req.user.role === 'OFFICE_WORKER') {
      const officeWorker = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { branchId: true }
      });

      if (!officeWorker?.branchId) {
        return res.status(403).json({ error: 'Office worker must be assigned to a branch' });
      }

      branchFilter = {
        user: {
          enrollments: {
            some: {
              class: {
                branchId: officeWorker.branchId
              }
            }
          }
        }
      };
    }

    // Get total revenue from payments
    const payments = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length && { paymentDate: dateFilter }),
        ...(req.user.role === 'OFFICE_WORKER' && branchFilter)
      },
      _sum: { amount: true },
      _count: true
    });

    // Get total expenses (all expenses for now, can be branch-specific later)
    const expenses = await prisma.expense.aggregate({
      where: Object.keys(dateFilter).length ? { date: dateFilter } : {},
      _sum: { amount: true },
      _count: true
    });

    // Get expenses by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: Object.keys(dateFilter).length ? { date: dateFilter } : {},
      _sum: { amount: true }
    });

    // Get pending payments
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        status: 'PENDING',
        ...(req.user.role === 'OFFICE_WORKER' && branchFilter)
      },
      _sum: { amount: true },
      _count: true
    });

    const totalRevenue = payments._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;

    res.json({
      revenue: {
        total: totalRevenue,
        count: payments._count
      },
      expenses: {
        total: totalExpenses,
        count: expenses._count,
        byCategory: expensesByCategory.map(e => ({
          category: e.category,
          amount: e._sum.amount || 0
        }))
      },
      pendingPayments: {
        total: pendingPayments._sum.amount || 0,
        count: pendingPayments._count
      },
      netIncome: totalRevenue - totalExpenses
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Get monthly breakdown (Admin only)
router.get('/monthly', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Get all payments for the year
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        paymentDate: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      select: { amount: true, paymentDate: true }
    });

    // Get all expenses for the year
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      select: { amount: true, date: true }
    });

    // Build monthly data
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthRevenue = payments
        .filter(p => new Date(p.paymentDate).getMonth() === month)
        .reduce((sum, p) => sum + p.amount, 0);

      const monthExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === month)
        .reduce((sum, e) => sum + e.amount, 0);

      monthlyData.push({
        month: month + 1,
        monthName: new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        netIncome: monthRevenue - monthExpenses
      });
    }

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly breakdown' });
  }
});

// Get instructor income (Admin only)
router.get('/instructor-income', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all instructors
    const instructors = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    // Calculate income for each instructor
    const instructorIncomeData = await Promise.all(
      instructors.map(async (instructor) => {
        // Get all classes taught by this instructor
        const classes = await prisma.class.findMany({
          where: { instructorId: instructor.id },
          select: {
            id: true,
            name: true,
            fee: true,
            enrollments: {
              select: {
                id: true,
                user: {
                  select: {
                    payments: {
                      where: {
                        status: 'COMPLETED',
                        ...(Object.keys(dateFilter).length && { paymentDate: dateFilter })
                      },
                      select: {
                        amount: true,
                        paymentDate: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Calculate total income from all classes
        let totalIncome = 0;
        let totalStudents = 0;
        let totalPayments = 0;

        classes.forEach(cls => {
          totalStudents += cls.enrollments.length;
          cls.enrollments.forEach(enrollment => {
            enrollment.user.payments.forEach(payment => {
              totalIncome += payment.amount;
              totalPayments++;
            });
          });
        });

        return {
          instructor: {
            id: instructor.id,
            name: `${instructor.firstName} ${instructor.lastName}`,
            email: instructor.email
          },
          totalIncome,
          totalClasses: classes.length,
          totalStudents,
          totalPayments,
          classes: classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            fee: cls.fee,
            students: cls.enrollments.length
          }))
        };
      })
    );

    // Sort by total income descending
    instructorIncomeData.sort((a, b) => b.totalIncome - a.totalIncome);

    res.json(instructorIncomeData);
  } catch (error) {
    console.error('Error fetching instructor income:', error);
    res.status(500).json({ error: 'Failed to fetch instructor income' });
  }
});

export default router;

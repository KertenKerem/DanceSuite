import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all expenses (Admin only)
router.get('/expenses', authenticate, authorize('ADMIN'), async (req, res) => {
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

// Create expense (Admin only)
router.post('/expenses', authenticate, authorize('ADMIN'), async (req, res) => {
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

// Get financial summary (Admin only)
router.get('/summary', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    // Get total revenue from payments
    const payments = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length && { paymentDate: dateFilter })
      },
      _sum: { amount: true },
      _count: true
    });

    // Get total expenses
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
      where: { status: 'PENDING' },
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

export default router;

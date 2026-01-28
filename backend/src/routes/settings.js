import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============= PUBLIC BRANDING ENDPOINT =============

// Get public branding (for login/register pages - NO AUTH REQUIRED)
router.get('/branding', async (req, res) => {
  try {
    const settings = await prisma.schoolSettings.findUnique({
      where: { id: 'default' },
      select: {
        schoolName: true,
        motto: true,
        logo: true
      }
    });

    // Return defaults if no settings exist
    res.json(settings || {
      schoolName: 'DanceSuite',
      motto: null,
      logo: null
    });
  } catch (error) {
    console.error('Get branding error:', error);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
});

// ============= ADMIN SETTINGS ENDPOINTS =============

// Get all settings (Admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    let settings = await prisma.schoolSettings.findUnique({
      where: { id: 'default' }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: { id: 'default' }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (Admin only)
router.put('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { schoolName, motto, logo, primaryColor, theme } = req.body;

    const settings = await prisma.schoolSettings.upsert({
      where: { id: 'default' },
      update: {
        schoolName,
        motto,
        logo,
        primaryColor,
        theme
      },
      create: {
        id: 'default',
        schoolName: schoolName || 'DanceSuite',
        motto,
        logo,
        primaryColor,
        theme
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============= BACKUP ENDPOINTS =============

// Create database backup (Admin only)
router.get('/backup', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [users, classes, enrollments, payments, attendance, expenses, branches, saloons, schedules, instructorConfigs, settings] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          address: true,
          birthday: true,
          parentName: true,
          parentPhone: true,
          parentEmail: true,
          createdAt: true
        }
      }),
      prisma.class.findMany(),
      prisma.enrollment.findMany(),
      prisma.payment.findMany(),
      prisma.attendance.findMany(),
      prisma.expense.findMany(),
      prisma.branch.findMany(),
      prisma.saloon.findMany(),
      prisma.schedule.findMany(),
      prisma.instructorPaymentConfig.findMany(),
      prisma.schoolSettings.findMany()
    ]);

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        users,
        classes,
        enrollments,
        payments,
        attendance,
        expenses,
        branches,
        saloons,
        schedules,
        instructorConfigs,
        settings
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=dancesuite-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json(backup);
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// ============= EXPORT ENDPOINTS =============

// Export users (Admin only)
router.get('/export/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { format = 'json', role } = req.query;
    const where = role ? { role } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        birthday: true,
        parentName: true,
        parentPhone: true,
        parentEmail: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Phone', 'Address', 'Birthday', 'Parent Name', 'Parent Phone', 'Parent Email', 'Enrollments', 'Payments', 'Created At'];
      const rows = users.map(u => [
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.role,
        u.phone || '',
        u.address || '',
        u.birthday ? new Date(u.birthday).toISOString().split('T')[0] : '',
        u.parentName || '',
        u.parentPhone || '',
        u.parentEmail || '',
        u._count.enrollments,
        u._count.payments,
        new Date(u.createdAt).toISOString()
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.json`);
      res.json({ exportedAt: new Date().toISOString(), users });
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

// Export financial data (Admin only)
router.get('/export/financial', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const paymentDateFilter = startDate || endDate ? { createdAt: dateFilter } : {};
    const expenseDateFilter = startDate || endDate ? { date: dateFilter } : {};

    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: paymentDateFilter,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.expense.findMany({
        where: expenseDateFilter,
        orderBy: { date: 'desc' }
      })
    ]);

    const totalRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (format === 'csv') {
      const headers = ['Type', 'Date', 'Amount', 'Status/Category', 'Description', 'User/Vendor'];
      const paymentRows = payments.map(p => [
        'Payment',
        new Date(p.createdAt).toISOString().split('T')[0],
        p.amount.toFixed(2),
        p.status,
        p.description || '',
        `${p.user.firstName} ${p.user.lastName}`
      ]);
      const expenseRows = expenses.map(e => [
        'Expense',
        new Date(e.date).toISOString().split('T')[0],
        (-e.amount).toFixed(2),
        e.category,
        e.description,
        e.vendor || ''
      ]);

      const csv = [
        headers.join(','),
        ...paymentRows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ...expenseRows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=financial-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=financial-export-${new Date().toISOString().split('T')[0]}.json`);
      res.json({
        exportedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        summary: {
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses
        },
        payments,
        expenses
      });
    }
  } catch (error) {
    console.error('Export financial error:', error);
    res.status(500).json({ error: 'Failed to export financial data' });
  }
});

// Export class data with student lists (Admin only)
router.get('/export/classes', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { classId } = req.query;
    const where = classId ? { id: classId } : {};

    const classes = await prisma.class.findMany({
      where,
      include: {
        instructor: {
          select: { firstName: true, lastName: true }
        },
        branch: {
          select: { name: true }
        },
        schedules: {
          include: {
            saloon: { select: { name: true } }
          }
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                parentName: true,
                parentPhone: true
              }
            }
          }
        }
      }
    });

    res.json({
      exportedAt: new Date().toISOString(),
      classes: classes.map(c => ({
        ...c,
        studentCount: c.enrollments.length,
        students: c.enrollments.map(e => e.user)
      }))
    });
  } catch (error) {
    console.error('Export classes error:', error);
    res.status(500).json({ error: 'Failed to export class data' });
  }
});

export default router;

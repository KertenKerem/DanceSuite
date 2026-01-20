import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get enrollment statistics
router.get('/enrollment-stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [totalStudents, totalClasses, activeEnrollments, enrollmentsByClass] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.class.count(),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.class.findMany({
        select: {
          name: true,
          _count: {
            select: { enrollments: true }
          }
        }
      })
    ]);

    res.json({
      totalStudents,
      totalClasses,
      activeEnrollments,
      enrollmentsByClass: enrollmentsByClass.map(c => ({
        className: c.name,
        count: c._count.enrollments
      }))
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({ error: 'Failed to get enrollment statistics' });
  }
});

// Get revenue report
router.get('/revenue', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const payments = await prisma.payment.findMany({
      where: whereClause
    });

    const total = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const completed = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pending = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const failed = payments
      .filter(p => p.status === 'FAILED')
      .reduce((sum, p) => sum + p.amount, 0);

    const refunded = payments
      .filter(p => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      total,
      completed,
      pending,
      failed,
      refunded
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue report' });
  }
});

// Get attendance summary
router.get('/attendance-summary', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    const whereClause = {};
    if (classId) {
      whereClause.enrollment = { classId };
    }
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const excused = attendance.filter(a => a.status === 'EXCUSED').length;

    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    res.json({
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ error: 'Failed to get attendance summary' });
  }
});

// Get student progress
router.get('/student-progress/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Students can only view their own progress
    if (req.user.role === 'STUDENT' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [enrollments, attendance, payments] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          class: {
            select: {
              name: true,
              description: true
            }
          }
        }
      }),
      prisma.attendance.findMany({
        where: {
          enrollment: { userId }
        }
      }),
      prisma.payment.findMany({
        where: { userId }
      })
    ]);

    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const totalPaid = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      enrollments,
      attendanceRate,
      totalAttendance,
      presentCount,
      totalPaid,
      pendingPayments
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Failed to get student progress' });
  }
});

export default router;

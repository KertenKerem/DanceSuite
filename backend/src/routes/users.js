import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============= CURRENT USER ROUTES (must be before /:id routes) =============

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        phone: true,
        address: true,
        birthday: true,
        profilePicture: true,
        parentName: true,
        parentPhone: true,
        parentEmail: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const {
      firstName, lastName, phone, address, birthday,
      profilePicture, parentName, parentPhone, parentEmail
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (parentName !== undefined) updateData.parentName = parentName;
    if (parentPhone !== undefined) updateData.parentPhone = parentPhone;
    if (parentEmail !== undefined) updateData.parentEmail = parentEmail;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        birthday: true,
        profilePicture: true,
        parentName: true,
        parentPhone: true,
        parentEmail: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============= ADMIN USER MANAGEMENT ROUTES =============

// Get all users (Admin and Office Worker)
router.get('/', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    // Office workers can only see students from their branch
    if (req.user.role === 'OFFICE_WORKER') {
      const officeWorker = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { branchId: true }
      });

      if (!officeWorker?.branchId) {
        return res.status(403).json({ error: 'Office worker must be assigned to a branch' });
      }

      where.role = 'STUDENT'; // Office workers can only see students
      where.enrollments = {
        some: {
          class: {
            branchId: officeWorker.branchId
          }
        }
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
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
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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
        enrollments: {
          include: {
            class: true
          }
        },
        payments: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (Admin and Office Worker)
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, role, branchId,
      phone, address, birthday,
      parentName, parentPhone, parentEmail
    } = req.body;

    // Office workers can only create students
    if (req.user.role === 'OFFICE_WORKER' && role !== 'STUDENT') {
      return res.status(403).json({ error: 'Office workers can only create students' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'STUDENT',
        branchId,
        phone,
        address,
        birthday: birthday ? new Date(birthday) : null,
        parentName,
        parentPhone,
        parentEmail
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        phone: true,
        address: true,
        birthday: true,
        parentName: true,
        parentPhone: true,
        parentEmail: true,
        createdAt: true
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (Admin and Office Worker)
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, role, branchId,
      phone, address, birthday,
      parentName, parentPhone, parentEmail
    } = req.body;

    // Office workers can only update students
    if (req.user.role === 'OFFICE_WORKER') {
      const targetUser = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { role: true }
      });
      if (!targetUser || targetUser.role !== 'STUDENT') {
        return res.status(403).json({ error: 'Office workers can only update students' });
      }
    }

    const updateData = {
      firstName,
      lastName,
      phone,
      address,
      birthday: birthday ? new Date(birthday) : null,
      parentName,
      parentPhone,
      parentEmail
    };

    // Only admins can change roles and branch
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (branchId !== undefined) updateData.branchId = branchId;
    }

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: req.params.id } }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        phone: true,
        address: true,
        birthday: true,
        parentName: true,
        parentPhone: true,
        parentEmail: true,
        createdAt: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin and Office Worker)
router.delete('/:id', authenticate, authorize('ADMIN', 'OFFICE_WORKER'), async (req, res) => {
  try {
    // Office workers can only delete students
    if (req.user.role === 'OFFICE_WORKER') {
      const targetUser = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { role: true }
      });
      if (!targetUser || targetUser.role !== 'STUDENT') {
        return res.status(403).json({ error: 'Office workers can only delete students' });
      }
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

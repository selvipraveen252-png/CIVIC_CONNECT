import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Issue from '../models/Issue';

// @desc    Get all users (with role and department filters)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, department, search } = req.query;
    const query: any = {};

    if (role && ['citizen', 'officer', 'admin'].includes(role as string)) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { phone: { $regex: search as string, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name description');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Get stats for this user
    let userStats = {};
    if (user.role === 'citizen') {
      const reportedCount = await Issue.countDocuments({ reportedBy: user._id });
      const resolvedCount = await Issue.countDocuments({ reportedBy: user._id, status: { $in: ['RESOLVED', 'CLOSED'] } });
      userStats = { reportedCount, resolvedCount };
    } else if (user.role === 'officer') {
      const assignedCount = await Issue.countDocuments({ assignedOfficer: user._id });
      const resolvedCount = await Issue.countDocuments({ assignedOfficer: user._id, status: { $in: ['RESOLVED', 'CLOSED'] } });
      userStats = { assignedCount, resolvedCount };
    }

    res.status(200).json({
      success: true,
      user,
      stats: userStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user (Admin)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'citizen',
      department: department || null,
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, role, department, phone } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role && ['citizen', 'officer', 'admin'].includes(role)) user.role = role;
    if (department !== undefined) user.department = department || null;
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({ success: false, message: 'Cannot delete the only administrator.' });
        return;
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';
import User from '../models/User';
import Issue from '../models/Issue';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public (or authenticated)
export const getDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public / Private
export const getDepartmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    // Also get officers belonging to this department
    const officers = await User.find({ department: department._id, role: 'officer' }).select('name email phone');

    res.status(200).json({
      success: true,
      department,
      officers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, contactEmail, contactPhone } = req.body;

    if (!name || !description || !contactEmail || !contactPhone) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, description, contactEmail, and contactPhone.',
      });
      return;
    }

    const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      res.status(400).json({ success: false, message: 'A department with this name already exists.' });
      return;
    }

    const department = await Department.create({
      name: name.trim(),
      description: description.trim(),
      contactEmail: contactEmail.toLowerCase().trim(),
      contactPhone: contactPhone.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    // Check if issues or officers are assigned
    const assignedIssuesCount = await Issue.countDocuments({ assignedDepartment: department._id });
    if (assignedIssuesCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${assignedIssuesCount} issues currently assigned to it.`,
      });
      return;
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

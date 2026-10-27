import { Request, Response, NextFunction } from 'express';
import mongoose from 'express';
import Issue, { IssueCategory, IssuePriority, IssueStatus } from '../models/Issue';
import Department from '../models/Department';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { handleImageUpload } from '../middleware/upload';
import { createNotification } from '../services/notificationService';
import { cacheService } from '../services/cacheService';

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (Citizen/Admin)
export const createIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      title,
      description,
      category,
      priority,
      address,
      latitude,
      longitude,
    } = req.body;

    if (!title || !description || !category || !address) {
      res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and address.',
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude coordinates are required.',
      });
      return;
    }

    // Process image upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = await handleImageUpload(req.file);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    // Auto-map category to department if a matching department exists
    let assignedDeptId = null;
    const departmentMatchMap: Record<string, string> = {
      'Road Damage': 'Public Works',
      'Pothole': 'Public Works',
      'Public Infrastructure': 'Public Works',
      'Water Leakage': 'Water Supply',
      'Drainage Problem': 'Water Supply',
      'Garbage Overflow': 'Solid Waste',
      'Streetlight Failure': 'Electricity',
      'Traffic Problem': 'Traffic Engineering',
    };

    const targetDeptKeyword = departmentMatchMap[category];
    if (targetDeptKeyword) {
      const matchedDept = await Department.findOne({
        name: { $regex: new RegExp(targetDeptKeyword, 'i') },
      });
      if (matchedDept) {
        assignedDeptId = matchedDept._id;
      }
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category: category as IssueCategory,
      priority: (priority as IssuePriority) || 'MEDIUM',
      status: 'REPORTED',
      image: imageUrl,
      location: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON order: [longitude, latitude]
      },
      address: address.trim(),
      reportedBy: req.user._id,
      assignedDepartment: assignedDeptId,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: req.user._id,
          changedAt: new Date(),
          remarks: 'Issue reported by citizen through CivicConnect platform.',
        },
      ],
    });

    await createNotification(
      req.user._id,
      `Your report "${issue.title}" has been successfully submitted and is under review.`,
      issue._id as any
    );

    // Invalidate dashboard/issue cache
    await cacheService.invalidate('stats:*');
    await cacheService.invalidate('issues:*');

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues with extensive filtering, sorting, geospatial search & pagination
// @route   GET /api/issues
// @access  Public / Private
export const getIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      category,
      status,
      priority,
      department,
      officer,
      search,
      lat,
      lng,
      radius, // in meters
      sort = '-createdAt',
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (department && department !== 'All') {
      query.assignedDepartment = department;
    }

    if (officer) {
      query.assignedOfficer = officer;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { address: { $regex: search as string, $options: 'i' } },
      ];
    }

    // Geospatial filter: $geoWithin with $centerSphere if coordinates provided
    if (lat && lng) {
      const maxDistanceMeters = radius ? parseFloat(radius as string) : 10000; // default 10km
      const earthRadiusMeters = 6378137; // Earth's approximate equatorial radius in meters
      const radians = maxDistanceMeters / earthRadiusMeters;
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng as string), parseFloat(lat as string)],
            radians,
          ],
        },
      };
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reportedBy', 'name email phone profileImage')
        .populate('assignedDepartment', 'name contactEmail')
        .populate('assignedOfficer', 'name email phone')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      Issue.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's reported issues
// @route   GET /api/issues/my
// @access  Private (Citizen)
export const getMyIssues = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const issues = await Issue.find({ reportedBy: req.user._id })
      .populate('assignedDepartment', 'name')
      .populate('assignedOfficer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue by ID with complete details and populated history
// @route   GET /api/issues/:id
// @access  Public / Private
export const getIssueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone profileImage role')
      .populate('assignedDepartment', 'name description contactEmail contactPhone')
      .populate('assignedOfficer', 'name email phone')
      .populate('statusHistory.changedBy', 'name role email');

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue details
// @route   PUT /api/issues/:id
// @access  Private (Admin or Citizen reporter if still REPORTED)
export const updateIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isOwner || issue.status !== 'REPORTED')) {
      res.status(403).json({
        success: false,
        message: 'You can only edit issues that you reported while they are still in REPORTED status.',
      });
      return;
    }

    const { title, description, category, priority, address, latitude, longitude } = req.body;

    if (title) issue.title = title.trim();
    if (description) issue.description = description.trim();
    if (category) issue.category = category;
    if (priority && isAdmin) issue.priority = priority;
    if (address) issue.address = address.trim();

    if (latitude && longitude) {
      issue.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (req.file) {
      issue.image = await handleImageUpload(req.file);
    }

    await issue.save();
    await cacheService.invalidate('stats:*');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (Admin or Citizen reporter if REPORTED)
export const deleteIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isOwner || issue.status !== 'REPORTED')) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue.',
      });
      return;
    }

    await issue.deleteOne();
    await cacheService.invalidate('stats:*');

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status with remarks and resolution evidence
// @route   PATCH /api/issues/:id/status
// @access  Private (Officer/Admin)
export const updateIssueStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { status, remarks } = req.body;

    const validStatuses: IssueStatus[] = [
      'REPORTED',
      'VERIFIED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED',
      'REJECTED',
      'REOPENED',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    // Process optional resolution evidence image
    let evidenceImageUrl = '';
    if (req.file) {
      evidenceImageUrl = await handleImageUpload(req.file);
    } else if (req.body.evidenceImage) {
      evidenceImageUrl = req.body.evidenceImage;
    }

    // Set resolvedAt timestamp if status is RESOLVED
    if (status === 'RESOLVED' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }

    // Update status
    issue.status = status;

    // Append to statusHistory
    issue.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      remarks: remarks || `Status transitioned to ${status} by ${req.user.name} (${req.user.role})`,
      evidenceImage: evidenceImageUrl,
    });

    await issue.save();

    // Populate issue for response
    await issue.populate([
      { path: 'reportedBy', select: 'name email phone' },
      { path: 'assignedDepartment', select: 'name' },
      { path: 'assignedOfficer', select: 'name email' },
      { path: 'statusHistory.changedBy', select: 'name role' },
    ]);

    // Send notification to the citizen who reported it
    await createNotification(
      issue.reportedBy._id,
      `Your issue "${issue.title}" status has been updated to "${status}". Remarks: ${remarks || 'No remarks provided'}`,
      issue._id as any
    );

    await cacheService.invalidate('stats:*');

    res.status(200).json({
      success: true,
      message: `Issue status successfully updated to ${status}`,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign issue to department and/or officer
// @route   PATCH /api/issues/:id/assign
// @access  Private (Officer/Admin)
export const assignIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { departmentId, officerId, priority, remarks } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    if (departmentId) {
      const deptExists = await Department.findById(departmentId);
      if (!deptExists) {
        res.status(400).json({ success: false, message: 'Selected department does not exist' });
        return;
      }
      issue.assignedDepartment = deptExists._id;
    }

    if (officerId) {
      const officerExists = await User.findOne({ _id: officerId, role: 'officer' });
      if (!officerExists) {
        res.status(400).json({ success: false, message: 'Selected officer does not exist or is not an officer' });
        return;
      }
      issue.assignedOfficer = officerExists._id;

      // Notify the officer
      await createNotification(
        officerExists._id,
        `You have been assigned to investigate issue: "${issue.title}" (${issue.category})`,
        issue._id as any
      );
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      issue.priority = priority;
    }

    // Automatically advance status to ASSIGNED if in REPORTED or VERIFIED
    if (issue.status === 'REPORTED' || issue.status === 'VERIFIED') {
      issue.status = 'ASSIGNED';
    }

    issue.statusHistory.push({
      status: issue.status,
      changedBy: req.user._id,
      changedAt: new Date(),
      remarks: remarks || `Assigned to department/officer by ${req.user.name} (${req.user.role})`,
    });

    await issue.save();

    await issue.populate([
      { path: 'reportedBy', select: 'name email phone' },
      { path: 'assignedDepartment', select: 'name contactEmail' },
      { path: 'assignedOfficer', select: 'name email phone' },
      { path: 'statusHistory.changedBy', select: 'name role' },
    ]);

    // Notify the citizen reporter
    await createNotification(
      issue.reportedBy._id,
      `Your issue "${issue.title}" has been assigned to department for action.`,
      issue._id as any
    );

    await cacheService.invalidate('stats:*');

    res.status(200).json({
      success: true,
      message: 'Issue assigned successfully',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen a resolved or closed issue
// @route   POST /api/issues/:id/reopen
// @access  Private (Citizen/Admin)
export const reopenIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { remarks } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found' });
      return;
    }

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only the original reporter or an administrator can reopen this issue.',
      });
      return;
    }

    if (!['RESOLVED', 'CLOSED', 'REJECTED'].includes(issue.status)) {
      res.status(400).json({
        success: false,
        message: `Cannot reopen an issue with status "${issue.status}". Only RESOLVED, CLOSED or REJECTED issues can be reopened.`,
      });
      return;
    }

    issue.status = 'REOPENED';
    issue.statusHistory.push({
      status: 'REOPENED',
      changedBy: req.user._id,
      changedAt: new Date(),
      remarks: remarks || `Citizen was dissatisfied with resolution and requested reopening.`,
    });

    await issue.save();

    // If an officer was assigned, notify them that it was reopened
    if (issue.assignedOfficer) {
      await createNotification(
        issue.assignedOfficer,
        `Issue "${issue.title}" was reopened by citizen with remarks: "${remarks || 'Reopened'}"`,
        issue._id as any
      );
    }

    await cacheService.invalidate('stats:*');

    res.status(200).json({
      success: true,
      message: 'Issue reopened successfully and returned to queue.',
      issue,
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import Issue from '../models/Issue';
import User from '../models/User';
import Department from '../models/Department';
import { AuthRequest } from '../middleware/auth';
import { cacheService } from '../services/cacheService';

// @desc    Get dashboard analytics & statistics
// @route   GET /api/dashboard/stats
// @access  Public (Landing page) / Private (Admin/Officer/Citizen)
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;
    const userDeptId = req.user?.department;

    // Cache key varies based on role
    const cacheKey = `stats:${userRole || 'public'}:${userId || 'anon'}`;
    const cachedStats = await cacheService.get(cacheKey);

    if (cachedStats) {
      res.status(200).json({ success: true, data: cachedStats, fromCache: true });
      return;
    }

    // Citizen specific dashboard stats
    if (userRole === 'citizen' && userId) {
      const [totalReports, pending, inProgress, resolved, recentReports] = await Promise.all([
        Issue.countDocuments({ reportedBy: userId }),
        Issue.countDocuments({ reportedBy: userId, status: { $in: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'REOPENED'] } }),
        Issue.countDocuments({ reportedBy: userId, status: 'IN_PROGRESS' }),
        Issue.countDocuments({ reportedBy: userId, status: { $in: ['RESOLVED', 'CLOSED'] } }),
        Issue.find({ reportedBy: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('assignedDepartment', 'name')
          .populate('assignedOfficer', 'name'),
      ]);

      const data = {
        totalReports,
        pending,
        inProgress,
        resolved,
        recentReports,
      };

      await cacheService.set(cacheKey, data, 60);
      res.status(200).json({ success: true, data });
      return;
    }

    // Officer specific dashboard stats
    if (userRole === 'officer' && userId) {
      // Find issues assigned to officer or officer's department
      const officerDeptQuery: any = {
        $or: [
          { assignedOfficer: userId },
          ...(userDeptId ? [{ assignedDepartment: userDeptId }] : []),
        ],
      };

      const [assignedIssues, pendingVerification, inProgress, resolved, issuesList] = await Promise.all([
        Issue.countDocuments(officerDeptQuery),
        Issue.countDocuments({ ...officerDeptQuery, status: { $in: ['REPORTED', 'VERIFIED'] } }),
        Issue.countDocuments({ ...officerDeptQuery, status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'] } }),
        Issue.countDocuments({ ...officerDeptQuery, status: { $in: ['RESOLVED', 'CLOSED'] } }),
        Issue.find(officerDeptQuery)
          .sort({ updatedAt: -1 })
          .limit(20)
          .populate('reportedBy', 'name email phone')
          .populate('assignedDepartment', 'name')
          .populate('assignedOfficer', 'name'),
      ]);

      const data = {
        assignedIssues,
        pendingVerification,
        inProgress,
        resolved,
        issuesList,
      };

      await cacheService.set(cacheKey, data, 60);
      res.status(200).json({ success: true, data });
      return;
    }

    // System-wide / Admin / Public stats
    const [
      totalUsers,
      totalIssues,
      pendingCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      rejectedCount,
      byCategoryAgg,
      byStatusAgg,
      byPriorityAgg,
      recentIssues,
      criticalIssues,
      recentUsers,
      departmentsCount,
    ] = await Promise.all([
      User.countDocuments(),
      Issue.countDocuments(),
      Issue.countDocuments({ status: { $in: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'REOPENED'] } }),
      Issue.countDocuments({ status: 'IN_PROGRESS' }),
      Issue.countDocuments({ status: 'RESOLVED' }),
      Issue.countDocuments({ status: 'CLOSED' }),
      Issue.countDocuments({ status: 'REJECTED' }),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Issue.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('reportedBy', 'name email')
        .populate('assignedDepartment', 'name'),
      Issue.find({
        priority: { $in: ['CRITICAL', 'HIGH'] },
        status: { $nin: ['RESOLVED', 'CLOSED'] },
      })
        .sort({ priority: 1, createdAt: -1 })
        .limit(6)
        .populate('reportedBy', 'name')
        .populate('assignedDepartment', 'name'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt department')
        .populate('department', 'name'),
      Department.countDocuments(),
    ]);

    // Format aggregations nicely
    const byCategory = byCategoryAgg.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    const byStatus = byStatusAgg.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    const byPriority = byPriorityAgg.map((item) => ({
      priority: item._id,
      count: item.count,
    }));

    const resolutionRate = totalIssues > 0
      ? Math.round(((resolvedCount + closedCount) / totalIssues) * 100)
      : 0;

    const data = {
      totalUsers,
      totalIssues,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount + closedCount,
      closedCount,
      rejectedCount,
      departmentsCount,
      resolutionRate,
      byCategory,
      byStatus,
      byPriority,
      recentIssues,
      criticalIssues,
      recentUsers,
    };

    await cacheService.set(cacheKey, data, 60);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

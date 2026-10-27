import { Router } from 'express';
import {
  createIssue,
  getIssues,
  getMyIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  assignIssue,
  reopenIssue,
} from '../controllers/issueController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/role';
import { upload } from '../middleware/upload';

const router = Router();

// Public / General listings
router.get('/', getIssues);
router.get('/my', authenticate, getMyIssues);
router.get('/:id', getIssueById);

// Issue creation (Authenticated Citizen/Admin)
router.post('/', authenticate, upload.single('image'), createIssue);

// Issue update & deletion
router.put('/:id', authenticate, upload.single('image'), updateIssue);
router.delete('/:id', authenticate, deleteIssue);

// Workflow updates: Officer / Admin actions
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('officer', 'admin'),
  upload.single('evidenceImage'),
  updateIssueStatus
);

router.patch(
  '/:id/assign',
  authenticate,
  authorizeRoles('officer', 'admin'),
  assignIssue
);

// Citizen / Admin reopen action
router.post('/:id/reopen', authenticate, reopenIssue);

export default router;

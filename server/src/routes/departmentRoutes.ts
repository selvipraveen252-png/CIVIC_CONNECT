import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/role';

const router = Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authenticate, authorizeRoles('admin'), createDepartment);
router.put('/:id', authenticate, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteDepartment);

export default router;

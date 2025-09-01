const express = require('express');
const router = express.Router();
const { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getRoleById,
  getUsersByRoleType,
  getRoleStatistics,
  bulkUpdateUserRoles
} = require('../controllers/roleController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth);
router.use(admin);

// Statistics endpoint (must come before /:id)
router.get('/statistics', getRoleStatistics);

// Users by role type endpoint (must come before /:id)
router.get('/users/:roleType', getUsersByRoleType);

// Bulk update endpoint
router.put('/bulk-update', bulkUpdateUserRoles);

router.route('/')
  .get(getRoles)
  .post(createRole);

router.route('/:id')
  .get(getRoleById)
  .put(updateRole)
  .delete(deleteRole);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, getUsersForSharing, getCurrentUser, updateCurrentUser, updateUserRole } = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth);

// Profile routes - accessible to all authenticated users
router.get('/profile', getCurrentUser);
router.put('/profile', updateCurrentUser);

// Sharing endpoint - accessible to all authenticated users (not just admins)
router.get('/sharing', getUsersForSharing);

// Admin-only routes
router.use(admin);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Route for updating user role (admin only)
router.put('/:id/role', updateUserRole);

module.exports = router; 
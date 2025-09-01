const mongoose = require('mongoose');
const User = require('../models/user');
const Role = require('../models/Role');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('role', '-createdAt -updatedAt -__v');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter query
    let dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      
      if (startDate) {
        // Start of the start date (00:00:00)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.createdAt.$gte = start;
      }
      
      if (endDate) {
        // End of the end date (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }
    
    // Apply filter and fetch users
    const users = await User.find(dateFilter).select('-password').populate('role', '-createdAt -updatedAt -__v').sort({ createdAt: -1 });
    
    // Add debug information in response headers for development
    res.set({
      'X-Filter-Applied': startDate || endDate ? 'true' : 'false',
      'X-Date-Range': startDate && endDate ? `${startDate} to ${endDate}` : (startDate ? `from ${startDate}` : (endDate ? `to ${endDate}` : 'none')),
      'X-Total-Count': users.length.toString()
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('role', '-createdAt -updatedAt -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (role) user.role = role;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (for sharing purposes)
// @route   GET /api/users
// @access  Private
exports.getUsersForSharing = async (req, res) => {
  try {
    const users = await User.find({}, 'name email').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = roleId;
    const updatedUser = await user.save();
    
    // Populate the role information
    await updatedUser.populate('role', '-createdAt -updatedAt -__v');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
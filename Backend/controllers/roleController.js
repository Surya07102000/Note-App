const Role = require('../models/Role');
const User = require('../models/user');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
const getRoles = async (req, res) => {
  try {
    const { includeUserCount } = req.query;
    let roles = await Role.find();
    
    if (includeUserCount === 'true') {
      // Add user count to each role
      roles = await Promise.all(roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id });
        return {
          ...role.toObject(),
          userCount
        };
      }));
    }
    
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create role
// @route   POST /api/roles
// @access  Private/Admin
const createRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const role = new Role({
      name,
      permissions,
      description
    });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
const updateRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, permissions, description },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await role.deleteOne();
    res.json({ message: 'Role removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private/Admin
const getRoleById = async (req, res) => {
  try {
    const { includeUsers } = req.query;
    let role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    role = role.toObject();
    
    if (includeUsers === 'true') {
      const users = await User.find({ role: req.params.id })
        .select('_id name email createdAt')
        .sort({ createdAt: -1 });
      role.users = users;
    }
    
    res.json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get users by role type
// @route   GET /api/roles/users/:roleType
// @access  Private/Admin
const getUsersByRoleType = async (req, res) => {
  try {
    const { roleType } = req.params;
    
    // Find role by name
    const role = await Role.findOne({ name: roleType });
    if (!role) {
      return res.status(404).json({ message: `Role '${roleType}' not found` });
    }
    
    // Get users with this role
    const users = await User.find({ role: role._id })
      .select('-password')
      .populate('role', 'name description permissions')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get role statistics
// @route   GET /api/roles/statistics
// @access  Private/Admin
const getRoleStatistics = async (req, res) => {
  try {
    // Get all roles with user counts
    const roles = await Role.find();
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
      const userCount = await User.countDocuments({ role: role._id });
      return {
        ...role.toObject(),
        userCount
      };
    }));
    
    // Get total counts
    const totalUsers = await User.countDocuments();
    const adminRole = await Role.findOne({ name: 'admin' });
    const userRole = await Role.findOne({ name: 'user' });
    
    const adminCount = adminRole ? await User.countDocuments({ role: adminRole._id }) : 0;
    const userCount = userRole ? await User.countDocuments({ role: userRole._id }) : 0;
    
    res.json({
      totalRoles: roles.length,
      totalUsers,
      adminCount,
      userCount,
      rolesWithCounts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk update user roles
// @route   PUT /api/roles/bulk-update
// @access  Private/Admin
const bulkUpdateUserRoles = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates must be an array' });
    }
    
    const results = [];
    
    for (const update of updates) {
      const { userId, roleId } = update;
      
      if (!userId || !roleId) {
        results.push({ userId, error: 'Missing userId or roleId' });
        continue;
      }
      
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { role: roleId },
          { new: true }
        ).populate('role', 'name description permissions');
        
        if (!user) {
          results.push({ userId, error: 'User not found' });
        } else {
          results.push({ userId, user, success: true });
        }
      } catch (error) {
        results.push({ userId, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  getUsersByRoleType,
  getRoleStatistics,
  bulkUpdateUserRoles
}; 
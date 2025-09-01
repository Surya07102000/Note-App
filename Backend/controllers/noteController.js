const Note = require('../models/Note');
const User = require('../models/user');

// Helper function to check if user can access note
const canAccessNote = (note, userId, requiredPermission = 'read') => {
  // Convert userId to string for comparison
  const userIdString = userId.toString();
  
  // Owner has full access - handle both populated and non-populated user field
  const noteUserId = (note.user._id || note.user).toString();
  if (noteUserId === userIdString) {
    return true;
  }
  
  // Check if user is shared with the note
  const sharedEntry = note.sharedWith.find(share => {
    // Handle both populated and non-populated user field in sharedWith
    const sharedUserId = (share.user._id || share.user).toString();
    return sharedUserId === userIdString;
  });
  
  if (!sharedEntry) {
    return false;
  }
  
  // For write permission, user must have write access
  if (requiredPermission === 'write' && sharedEntry.permission !== 'write') {
    return false;
  }
  
  return true;
};

// @desc    Get all notes for a user (owned or shared)
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { user: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    }).populate('user', 'name email').populate('sharedWith.user', 'name email').sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'name email')
      .populate('sharedWith.user', 'name email');
      
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user can access the note
    if (!canAccessNote(note, req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to access this note' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({
      title,
      content,
      tags,
      user: req.user._id
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user can write to the note
    if (!canAccessNote(note, req.user._id, 'write')) {
      return res.status(401).json({ message: 'Not authorized to edit this note' });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'name email').populate('sharedWith.user', 'name email');
    
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can delete the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only the owner can delete this note' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share a note with another user
// @route   POST /api/notes/:id/share
// @access  Private
exports.shareNote = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    
    if (!userId || !permission || !['read', 'write'].includes(permission)) {
      return res.status(400).json({ message: 'Valid userId and permission (read/write) are required' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can share the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only the owner can share this note' });
    }

    // Check if user exists
    const userToShare = await User.findById(userId);
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already shared with this user
    const alreadyShared = note.sharedWith.find(share => share.user.toString() === userId);
    if (alreadyShared) {
      return res.status(400).json({ message: 'Note is already shared with this user' });
    }

    // Add user to sharedWith array
    note.sharedWith.push({ user: userId, permission });
    await note.save();

    const updatedNote = await Note.findById(req.params.id)
      .populate('user', 'name email')
      .populate('sharedWith.user', 'name email');

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sharing permission
// @route   PUT /api/notes/:id/share/:userId
// @access  Private
exports.updateSharing = async (req, res) => {
  try {
    const { permission } = req.body;
    const { userId } = req.params;
    
    if (!permission || !['read', 'write'].includes(permission)) {
      return res.status(400).json({ message: 'Valid permission (read/write) is required' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can update sharing
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only the owner can update sharing for this note' });
    }

    // Find and update the sharing entry
    const shareIndex = note.sharedWith.findIndex(share => share.user.toString() === userId);
    if (shareIndex === -1) {
      return res.status(404).json({ message: 'User is not shared with this note' });
    }

    note.sharedWith[shareIndex].permission = permission;
    await note.save();

    const updatedNote = await Note.findById(req.params.id)
      .populate('user', 'name email')
      .populate('sharedWith.user', 'name email');

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove sharing for a user
// @route   DELETE /api/notes/:id/share/:userId
// @access  Private
exports.removeSharing = async (req, res) => {
  try {
    const { userId } = req.params;

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can remove sharing
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only the owner can remove sharing for this note' });
    }

    // Remove user from sharedWith array
    note.sharedWith = note.sharedWith.filter(share => share.user.toString() !== userId);
    await note.save();

    const updatedNote = await Note.findById(req.params.id)
      .populate('user', 'name email')
      .populate('sharedWith.user', 'name email');

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search notes by tags
// @route   GET /api/notes/search
// @access  Private
exports.searchNotes = async (req, res) => {
  try {
    const { tags } = req.query;
    let query = {
      $or: [
        { user: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    };

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const notes = await Note.find(query)
      .populate('user', 'name email')
      .populate('sharedWith.user', 'name email')
      .sort({ updatedAt: -1 });
      
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
const express = require('express');
const router = express.Router();
const { 
  getNotes, 
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote, 
  searchNotes,
  shareNote,
  updateSharing,
  removeSharing
} = require('../controllers/noteController');
const auth = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.get('/search', searchNotes);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

// Sharing routes
router.post('/:id/share', shareNote);
router.put('/:id/share/:userId', updateSharing);
router.delete('/:id/share/:userId', removeSharing);

module.exports = router; 
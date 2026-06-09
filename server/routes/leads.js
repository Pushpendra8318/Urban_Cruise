const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getLeads, getLead, createLead, updateLead, deleteLead, bulkUpdate, addNote } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getLeads);
router.post('/', [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('source').isIn(['website', 'meta', 'google', 'manual']).withMessage('Invalid source'),
], createLead);

router.put('/bulk-update', authorize('admin', 'manager'), bulkUpdate);

router.get('/:id', getLead);
router.put('/:id', updateLead);
router.delete('/:id', authorize('admin', 'manager'), deleteLead);
router.post('/:id/notes', body('text').notEmpty().withMessage('Note text is required'), addNote);

module.exports = router;

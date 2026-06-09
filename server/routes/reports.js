const express = require('express');
const router = express.Router();
const { exportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/export', exportReport);

module.exports = router;

// This is the correct code for routes/dashboard.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get productivity statistics for the user
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.completed).length,
      totalTime: tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0),
      pendingTasks: tasks.filter(task => !task.completed).length
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
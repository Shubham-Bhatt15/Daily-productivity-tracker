const express = require('express');
const { protect } = require('../middleware/auth');  
const Task = require('../models/Task');
const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get user's productivity stats
// @access  Private (requires JWT)
router.get('/stats', protect, async (req, res) => {  
  try {
    const tasks = await Task.find({ user: req.user._id });

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.isCompleted).length,
      totalTime: tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0),
      pendingTasks: tasks.filter(task => !task.isCompleted).length
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

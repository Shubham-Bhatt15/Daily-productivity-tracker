const express = require('express');
const router = express.Router();

// Import the controller functions
const { 
    getTasks, 
    createTask, 
    toggleTask, 
    deleteTask,
    updateTaskDetails,
    updateTaskTime,
    startTimer,
    stopTimer 
} = require('../controllers/taskController');

// Import the authentication middleware
const { protect } = require('../middleware/auth');

// --- Route Definitions ---

// Routes for /api/tasks
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

// Routes for /api/tasks/:id
router.route('/:id')
  .put(protect, toggleTask)
  .delete(protect, deleteTask);

// Routes for timers and time updates
router.patch('/:id/details', protect, updateTaskDetails);
router.patch('/:id/time', protect, updateTaskTime);
router.patch('/:id/start-timer', protect, startTimer);
router.patch('/:id/stop-timer', protect, stopTimer);

module.exports = router;
const express = require('express');
const { getTasks, createTask, toggleTask, deleteTask,updateTaskTime,startTimer,stopTimer } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, toggleTask)
  .delete(protect, deleteTask);

router.patch('/:id/time', protect, updateTaskTime);
router.patch('/:id/start-timer',protect,startTimer); //start automatic
router.patch('/:id/stop-timer',protect,stopTimer);    //Stop automatic timer

module.exports = router;
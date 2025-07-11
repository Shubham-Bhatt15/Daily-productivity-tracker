const Task = require('../models/Task');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  const { title } = req.body;

  try {
    const task = await Task.create({
      user: req.user._id,
      title,
     
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle task completion
// @route   PUT /api/tasks/:id
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    
    // NEW: Stop timer if task is being marked complete
    if (!task.completed && task.isRunning) {
      const elapsed = Math.floor((Date.now() - task.lastStartedAt) / 1000);
      task.timeSpent += elapsed;
      task.isRunning = false;
    }
    
     task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // await task.remove();         // yha bhi change tha
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Update time spent on a task
// @route   PATCH /api/tasks/:id/time
const updateTaskTime = async (req, res) => {
  try {
    const { timeSpent } = req.body;
    
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      return res.status(400).json({ message: 'Invalid time value' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { timeSpent },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// NEW CONTROLLER: Start task timer
// @desc    Start task timer  
// @route   PATCH /api/tasks/:id/start-timer  
const startTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Prevent starting timer on completed tasks
    if (task.completed) {
      return res.status(400).json({ message: 'Cannot start timer on completed task' });
    }

    task.isRunning = true;
    task.lastStartedAt = Date.now();
    await task.save();
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to start timer' });
  }
};




// NEW: Stop timer controller
// @desc    Stop task timer
// @route   PATCH /api/tasks/:id/stop-timer
const stopTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.isRunning) {
      return res.status(400).json({ message: 'Timer is not running' });
    }

    // Calculate elapsed time and update
    const elapsed = Math.floor((Date.now() - task.lastStartedAt) / 1000);
    task.timeSpent += elapsed;
    task.isRunning = false;
    await task.save();
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to stop timer' });
  }
};

module.exports = { getTasks, createTask, toggleTask, deleteTask,updateTaskTime,startTimer,stopTimer };
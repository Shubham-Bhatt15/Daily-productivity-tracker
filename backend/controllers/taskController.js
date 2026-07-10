const Task = require('../models/Task');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    let query = Task.find({user:req.user._id});

    if(req.query.sort === 'dueDate'){
      const tasks = await Task.aggregate([
        { $match: { user: req.user._id}},
        { $addFields: {hasDueDate:{ $cond: [{$ifNull: ['$dueDate',false]},1,0]}}},
        { $sort: {hasDueDate: -1, dueDate:1, createdAt: -1}},
      ])
      return res.json(tasks);
    }
    const tasks = await query.sort({ createdAt: -1});
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  const { title,description } = req.body;
  if(!title || !title.trim()){
    return res.status(400).json({message: 'Title is required'});
  }
  if (dueDate && isNaN(new Date(dueDate).getTime())){
    return res.status(400).json({message: 'Invalid due date'});
  }

  try {
    const task = await Task.create({
      user: req.user._id,
      title:title.trim(),
      description:description ? description.trim():'',
      dueDate: duedDate ? newDate(dueDate): null,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateTaskDetails = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        updates.dueDate = null;
      } else if (isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ message: 'Invalid due date' });
      } else {
        updates.dueDate = new Date(dueDate);
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle task completion
// @route   PUT /api/tasks/:id
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
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
    const task = await Task.findOneAndDelete({_id: req.params.id, user:req.user._id});
    if (!task) return res.status(404).json({ message: 'Task not found' });

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

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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
// @desc    Start task timer
// @route   PATCH /api/tasks/:id/start-timer
const startTimer = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.completed) {
      return res.status(400).json({ message: 'Cannot start timer on completed task' });
    }

    // Enforce only one running timer per user: stop any other task
    // that's currently running before starting this one.
    const otherRunning = await Task.find({
      user: req.user._id,
      isRunning: true,
      _id: { $ne: task._id },
    });

    for (const other of otherRunning) {
      const elapsed = Math.floor((Date.now() - other.lastStartedAt) / 1000);
      other.timeSpent += elapsed;
      other.isRunning = false;
      await other.save();
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
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
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

module.exports = { getTasks, createTask, toggleTask, deleteTask,updateTaskTime,updateTaskDetails,startTimer,stopTimer };
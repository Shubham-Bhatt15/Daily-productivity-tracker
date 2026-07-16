const mongoose = require('mongoose');

// Every start->stop cycle becomes one row here. This is the piece that
// turns "totalTime: 4520" into actual charts: time-by-day, time-by-hour,
// average session length, etc. Task.timeSpent stays as a running total
// (cheap to read for the task list) but this table is the source of truth
// for anything analytical.
const timerSessionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    // null while the session is running; set on stop
    endedAt: {
      type: Date,
      default: null,
    },
    // duration in seconds, filled in when the session is stopped
    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Fast lookup for "does this user have a session running right now"
timerSessionSchema.index({ user: 1, endedAt: 1 });

module.exports = mongoose.model('TimerSession', timerSessionSchema);
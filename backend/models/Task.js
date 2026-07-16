const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true },

    timeSpent: { type: Number, default: 0,min: [0,'Time cannot be negative'] },

    completed: { 
      type: Boolean, 
      default: false 
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    date: { type: Date, default: Date.now },

    description: { type: String, default: '' },

    isRunning: {  // NEW: For tracking active timers
      type: Boolean,
      default: false
    },
    lastStartedAt: {  // NEW: For calculating elapsed time
      type: Date
    }
  },
  { timestamps: true,
    toJSON: {virtuals:true},
    toObject:{ virtuals:true}


   }
);
// virtual property not saved in db instead checking in frontend or backend logic just check using this virtual property.
taskSchema.virtual('isOverdue').get(function () {
  return Boolean(this.dueDate) && !this.completed && new Date(this.dueDate) < new Date();
});

module.exports = mongoose.model('Task', taskSchema);
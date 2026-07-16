const mongoose = require('mongoose');
const Task = require('../models/Task');
const TimerSession = require('../models/TimerSession');

// GET /api/dashboard/stats
// Kept your original shape (totalTasks, completedTasks, pendingTasks,
// totalTime) but added an `analytics` block. Old frontend code that only
// reads the top-level fields keeps working unchanged.
exports.getStats = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const [totalTasks, completedTasks, timeAgg] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, completed: true }),
    Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalTime: { $sum: '$timeSpent' } } },
    ]),
  ]);

  const totalTime = timeAgg[0]?.totalTime || 0;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- Analytics from TimerSession, last 7 days ---
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const timeByDay = await TimerSession.aggregate([
    {
      $match: {
        user: userId,
        endedAt: { $ne: null, $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        totalSeconds: { $sum: '$durationSeconds' },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Which hour of day the user tends to work — 0-23 buckets
  const timeByHour = await TimerSession.aggregate([
    { $match: { user: userId, endedAt: { $ne: null } } },
    {
      $group: {
        _id: { $hour: '$startedAt' },
        totalSeconds: { $sum: '$durationSeconds' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const priorityBreakdown = await Task.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  res.json({
    totalTasks,
    completedTasks,
    pendingTasks,
    totalTime,
    completionRate,
    analytics: {
      timeByDay,        // [{ _id: '2026-07-14', totalSeconds, sessionCount }, ...]
      timeByHour,        // [{ _id: 9, totalSeconds }, ...] — hour in server-local time
      priorityBreakdown, // [{ _id: 'high', count: 3 }, ...]
    },
  });
};
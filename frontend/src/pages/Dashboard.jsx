import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../context/AuthContext';

const formatTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Loading stats...</div>;

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Good day, {user?.name} 👋</h1>
        <p>Here's your productivity overview</p>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Tasks"     value={stats?.totalTasks ?? 0}                color="#6366f1" />
        <StatsCard label="Completed"       value={stats?.completedTasks ?? 0}            color="#22c55e" />
        <StatsCard label="Pending"         value={stats?.pendingTasks ?? 0}              color="#f59e0b" />
        <StatsCard label="Time Tracked"    value={formatTime(stats?.totalTime ?? 0)}     color="#3b82f6" />
        <StatsCard label="Completion Rate" value={`${completionRate}%`}                  color="#ec4899" />
      </div>
    </div>
  );
};

export default Dashboard;
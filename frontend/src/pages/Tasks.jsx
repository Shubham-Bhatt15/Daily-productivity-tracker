import { useState, useEffect } from 'react';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '',dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchTasks = () => {
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', form);
      setTasks(prev => [res.data, ...prev]);
      setForm({ title: '', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    await api.put(`/tasks/${id}`);
    setTasks(prev =>
      prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const handleUpdateTime = async (id) => {
    const res = await api.get('/tasks');
    const updated = res.data.find(t => t._id === id);
    if (updated) {
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

 const handleUpdateDueDate = async (id, dueDate) => {
  try {
    const res = await api.patch(`/tasks/${id}/details`, { dueDate: dueDate || null });
    console.log('PATCH response:', res.data); // check this in devtools, remove once confirmed
    setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
  } catch (err) {
    console.error('Failed to update due date:', err.response?.data || err.message);
  }
};

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>{tasks.length} total tasks</p>
      </div>

      <form onSubmit={handleCreate} className="task-form">
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Add a new task..."
          className="task-input"
          required
        />
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Description (optional)"
          className="task-input"
        />
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adding...' : '+ Add Task'}
        </button>
      </form>

      <div className="filter-tabs">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No {filter === 'all' ? '' : filter} tasks yet.</div>
      ) : (
        <div className="task-list">
          {filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdateTime={handleUpdateTime}
              
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
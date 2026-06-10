import { useTimer } from '../hooks/useTimer';

const TaskCard = ({ task, onToggle, onDelete, onUpdateTime }) => {
  const { formatted, running, start, stop } = useTimer(
    task._id,
    task.timeSpent || 0,
    task.timerRunning || false
  );

  const handleTimerToggle = async () => {
    if (running) {
      await stop();
      onUpdateTime(task._id);
    } else {
      await start();
    }
  };

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task._id)}
        />
        <h3 className="task-title">{task.title}</h3>
        <button onClick={() => onDelete(task._id)} className="btn-delete">✕</button>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <span className="task-time">⏱ {formatted}</span>
        <button
          onClick={handleTimerToggle}
          className={`btn-timer ${running ? 'running' : ''}`}
          disabled={task.completed}
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
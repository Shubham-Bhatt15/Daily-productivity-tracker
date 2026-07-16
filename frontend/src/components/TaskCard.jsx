
import { useTimerContext } from '../context/TimerContext';



const TaskCard = ({ task, onToggle, onDelete, onUpdateTime, onUpdateDueDate }) => {
  const { isTaskRunning, liveElapsed, startTimer, stopTimer, format } = useTimerContext();

  const running = isTaskRunning(task._id);
  const displaySeconds = running ? liveElapsed : task.timeSpent || 0;

  const handleTimerToggle = async () => {
    try {
      if (running) {
        await stopTimer(task._id);
        onUpdateTime(task._id);
      } else {
        await startTimer(task._id);
      }
    } catch (err) {
      console.error('Timer toggle failed:', err.response?.data || err.message);
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
        <span className="task-time">⏱ {format(displaySeconds)}</span>
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
// import { useTimerContext } from '../context/TimerContext';

// const formatDueDate = (dueDate) => {
//   if (!dueDate) return null;
//   return new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
// };

// const TaskCard = ({ task, onToggle, onDelete, onUpdateTime, onUpdateDueDate }) => {
//   const { isTaskRunning, liveElapsed, startTimer, stopTimer, format } = useTimerContext();

//   const running = isTaskRunning(task._id);
//   const displaySeconds = running ? liveElapsed : task.timeSpent || 0;

//   const handleTimerToggle = async () => {
//     try{
//       if (running) {
//       await stopTimer(task._id);
//       onUpdateTime(task._id);
//     } else {
//       await startTimer(task._id);
//     }

//     } catch(err){
//       console.error('Timer toggle failed:',err.response?.data||err.message);
//     }
    
//   };

//   const handleDueDateChange = (e) => {
//     onUpdateDueDate(task._id, e.target.value);
//   };

//   return (
//     <div className={`task-card ${task.completed ? 'completed' : ''}`}>
//       <div className="task-header">
//         <input
//           type="checkbox"
//           checked={task.completed}
//           onChange={() => onToggle(task._id)}
//         />
//         <h3 className="task-title">{task.title}</h3>
//         <button onClick={() => onDelete(task._id)} className="btn-delete">✕</button>
//       </div>

//       {task.description && (
//         <p className="task-description">{task.description}</p>
//       )}

//       <div className="task-due-date">
//         {task.isOverdue && <span className="badge-overdue">Overdue</span>}
//         {task.dueDate && !task.isOverdue && (
//           <span className="due-date-label">Due {formatDueDate(task.dueDate)}</span>
//         )}
//         <input
//           type="date"
//           value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
//           onChange={handleDueDateChange}
//           className="due-date-input"
//           aria-label="Edit due date"
//         />
//       </div>


//       <div className="task-footer">
//         <span className="task-time">⏱ {format(displaySeconds)}</span>
//         <button
//           onClick={handleTimerToggle}
//           className={`btn-timer ${running ? 'running' : ''}`}
//           disabled={task.completed}
//         >
//           {running ? '⏸ Pause' : '▶ Start'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TaskCard;


import { useTimerContext } from '../context/TimerContext';

const formatDueDate = (dueDate) => {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

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

  const handleDueDateChange = (e) => {
    onUpdateDueDate(task._id, e.target.value);
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

      <label
        htmlFor={`due-date-${task._id}`}
        className={`due-date-pill ${
          task.isOverdue ? 'overdue' : task.dueDate ? 'has-date' : 'no-date'
        }`}
      >
        <span className="due-date-icon">📅</span>
        <span className="due-date-text">
          {task.isOverdue
            ? `Overdue · ${formatDueDate(task.dueDate)}`
            : task.dueDate
            ? `Due ${formatDueDate(task.dueDate)}`
            : 'Add due date'}
        </span>
        <input
          id={`due-date-${task._id}`}
          type="date"
          value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
          onChange={handleDueDateChange}
          className="due-date-input-hidden"
        />
      </label>

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
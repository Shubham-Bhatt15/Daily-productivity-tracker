import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export const useTimer = (taskId, initialTime = 0, isRunning = false) => {
  const [elapsed, setElapsed] = useState(initialTime);
  const [running, setRunning] = useState(isRunning);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = async () => {
    await api.patch(`/tasks/${taskId}/start-timer`);
    setRunning(true);
  };

  const stop = async () => {
    await api.patch(`/tasks/${taskId}/stop-timer`);
    setRunning(false);
  };

  const format = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return { elapsed, running, start, stop, formatted: format(elapsed) };
};
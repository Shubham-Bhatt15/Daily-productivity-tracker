import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export const useTimer = (taskId, initialTime = 0, isRunning = false, lastStartedAt = null) => {
  const getElapsed = () => {
    if (isRunning && lastStartedAt) {
      return initialTime + Math.floor((Date.now() - new Date(lastStartedAt).getTime()) / 1000);
    }
    return initialTime;
  };

  const [elapsed, setElapsed] = useState(getElapsed);
  const [running, setRunning] = useState(isRunning);
  const intervalRef = useRef(null);
  const startedAtRef = useRef(lastStartedAt);
  const baseTimeRef = useRef(initialTime);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        // Calculate from real timestamps, not by counting ticks
        const base = baseTimeRef.current;
        const start = startedAtRef.current;
        if (start) {
          setElapsed(base + Math.floor((Date.now() - new Date(start).getTime()) / 1000));
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = async () => {
    const res = await api.patch(`/tasks/${taskId}/start-timer`);
    baseTimeRef.current = res.data.timeSpent;
    startedAtRef.current = res.data.lastStartedAt;
    setElapsed(res.data.timeSpent);
    setRunning(true);
  };

  const stop = async () => {
    const res = await api.patch(`/tasks/${taskId}/stop-timer`);
    baseTimeRef.current = res.data.timeSpent;
    startedAtRef.current = null;
    setElapsed(res.data.timeSpent);
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
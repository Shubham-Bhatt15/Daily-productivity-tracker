import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

import api from '../api/axios';

const TimerContext = createContext(null);

export const TimerProvider = ({ children })=>{
    const [runningTaskId, setRunningTaskId] =  useState(null);
    const [baseTime, setBaseTime]  = useState(0);
    const [startedAt,setStartedAt] = useState(null);
    const [liveElapsed,setLiveElapsed] = useState(0);

    const intervalRef = useRef(null);

    useEffect(()=>{
        if(runningTaskId && startedAt){
            const tick = () => {
                
                const secondsSinceStart = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
                setLiveElapsed(baseTime + secondsSinceStart); 
            };
            tick();
            intervalRef.current = setInterval(tick,1000);
        } else {
            setLiveElapsed(0);
        }
        return () =>  clearInterval(intervalRef.current);

    }, [runningTaskId, startedAt,baseTime]);
    
    useEffect(() => {
    const restoreRunningTask = async () => {
        const token = localStorage.getItem('token');
        if (!token) return; // nothing to restore if not logged in

        try {
            const res = await api.get('/tasks');
            const running = res.data.find((t) => t.isRunning);
            if (running) {
                setRunningTaskId(running._id);
                setBaseTime(running.timeSpent);
                setStartedAt(running.lastStartedAt);
            }
        } catch (err) {}
    };
    restoreRunningTask();
}, []);

    const startTimer =  useCallback(async (taskId)=>{
        const res = await api.patch(`/tasks/${taskId}/start-timer`);
        setRunningTaskId(taskId);
        setBaseTime(res.data.timeSpent);
        setStartedAt(res.data.lastStartedAt);
        return res.data;
    },[]);

    const stopTimer = useCallback(async (taskId)=>{
        const res = await api.patch(`/tasks/${taskId}/stop-timer`);
        setRunningTaskId(null);
        setBaseTime(0);
        setStartedAt(null);
        return res.data;
    },[]);

    const isTaskRunning  = useCallback((taskId) => runningTaskId === taskId,[runningTaskId]);
    
    const format  = (secs) =>{
        const h = Math.floor(secs/3600).toString().padStart(2,'0');
        const m = Math.floor((secs%3600)/60).toString().padStart(2,'0');
        const s = (secs%60).toString().padStart(2,'0');
        return `${h}:${m}:${s}`;
    };
    return (
        <TimerContext.Provider
      value={{
        runningTaskId,
        liveElapsed,
        baseTime,
        isTaskRunning,
        startTimer,
        stopTimer,
        formatted: format(liveElapsed),
        format,
      }}
    >
      {children}
    </TimerContext.Provider>
    );
};

export const useTimerContext = () => useContext(TimerContext);
 
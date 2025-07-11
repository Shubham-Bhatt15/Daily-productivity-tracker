
import React, { useEffect, useState } from "react";
import axios from "axios"; //added

import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; //auth rediredcts

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [quote, setQuote] = useState("Stay productive and keep going!");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true); // ✅ ADDED loading state
  const navigate = useNavigate(); //also
 
    // ✅ COMPLETELY CHANGED data fetching to use backend API
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Fetch user data
        const userRes = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(userRes.data.name || "Guest");

        // Fetch tasks from backend
        const tasksRes = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Transform backend tasks to frontend format
        setTasks(
          tasksRes.data.tasks.map((task) => ({
            id: task._id, // ✅ NOTE: Converting _id to id
            title: task.title,
            completed: task.completed,
            timeSpent: task.timeSpent || 0, // ✅ Added fallback
            isRunning: false, // Frontend-only timer state
            startTime: null,
            baseTimeSpent: task.timeSpent || 0
          }))
        );
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  
  
  
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.isRunning) {
            const elapsed = Math.floor((Date.now() - task.startTime) / 1000);
            return { ...task, timeSpent: task.baseTimeSpent + elapsed };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);


//changes made

  const addTask = async () => {
    if (newTask.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/tasks",
        { title: newTask, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks([
        ...tasks,
        {
          id: res.data._id, // ✅ Using backend-generated ID
          title: res.data.title,
          completed: false,
          timeSpent: 0,
          isRunning: false,
          startTime: null,
          baseTimeSpent: 0
        }
      ]);
      setNewTask("");
    } catch (err) {
      console.error("Add task error:", err);
    }
  };


  // ✅ MODIFIED to sync with backend
  const toggleTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const taskToUpdate = tasks.find((task) => task.id === id);
      
      await axios.patch(
        `/api/tasks/${id}`,
        { completed: !taskToUpdate.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

 

  
   const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
 
  





  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
  };

   
  // ✅ MODIFIED to sync with backend
  const saveEditedTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/tasks/${id}`,
        { title: editedTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, title: editedTitle } : task
        )
      );
      setEditingTaskId(null);
      setEditedTitle("");
    } catch (err) {
      console.error("Save error:", err);
    }
  };



  const startTimer = (id) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? {
            ...task,
            isRunning: true,
            startTime: Date.now(),
            baseTimeSpent: task.timeSpent
          }
        : task
    ));
  };

 // Replace your current stopTimer function with:
const stopTimer = async (id) => {
  try {
    const task = tasks.find(t => t.id === id);
    const elapsed = Math.floor((Date.now() - task.startTime) / 1000);
    const totalTime = task.baseTimeSpent + elapsed;

    // Sync with backend
    await axios.patch(`/api/tasks/${id}/time`, 
      { timeSpent: totalTime },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    // Update local state
    setTasks(tasks.map(task => 
      task.id === id ? {
        ...task,
        isRunning: false,
        timeSpent: totalTime,
        startTime: null,
        baseTimeSpent: totalTime
      } : task
    ));
  } catch (err) {
    console.error('Failed to save time:', err);
  }
};

  
 
 
 
 
 
 
 
 
 
 
 
  if (isLoading) return <div className="p-4">Loading dashboard...</div>; // ✅ ADDED loading state

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const productivity =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#F4F6F8] text-[#333333] p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#3F51B5]">
          Hello, {userName}! 📅 {dayjs().format("MMMM D, YYYY")}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-[#FF9800] text-white p-4 rounded-2xl shadow">
            <h2 className="font-semibold">Today's Tasks</h2>
            <p>{completedTasks}/{totalTasks} Done</p>
          </div>
          <div className="bg-[#4CAF50] text-white p-4 rounded-2xl shadow">
            <h2 className="font-semibold">Productivity</h2>
            <p className="font-bold text-lg">{productivity}%</p>
          </div>
          <div className="bg-[#9C27B0] text-white p-4 rounded-2xl shadow">
            <h2 className="font-semibold">Time</h2>
            <p>{dayjs().format("hh:mm A")}</p>
          </div>
          <div className="bg-[#81D4FA] text-black p-4 rounded-2xl shadow">
            <h2 className="font-semibold">Quote</h2>
            <p className="italic">"{quote}"</p>
          </div>
        </div>

        {/* Task List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2 text-[#009688]">📝 Task List</h2>
          <ul className="mb-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex flex-col sm:flex-row justify-between items-center border p-2 rounded mb-2 ${
                  task.completed ? "bg-green-100" : "bg-white"
                }`}
              >
                <div className="flex-1 w-full">
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="p-1 border rounded w-full text-black"
                    />
                  ) : (
                    <span
                      className={
                        task.completed
                          ? "line-through text-gray-500"
                          : "text-black"
                      }
                    >
                      {task.title}
                    </span>
                  )}
                  <p className="text-sm text-gray-600">
                    Time: {formatTime(task.timeSpent || 0)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-2">
                  {editingTaskId === task.id ? (
                    <button
                      onClick={() => saveEditedTask(task.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(task)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`${
                      task.completed ? "bg-purple-600" : "bg-blue-500"
                    } text-white px-2 py-1 rounded`}
                  >
                    {task.completed ? "Undo" : "Done"}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  {!task.isRunning ? (
                    <button
                      onClick={() => startTimer(task.id)}
                      className="bg-[#009688] text-white px-2 py-1 rounded"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={() => stopTimer(task.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Task Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-grow p-2 border rounded text-black"
            />
            <button
              onClick={addTask}
              className="bg-[#009688] text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

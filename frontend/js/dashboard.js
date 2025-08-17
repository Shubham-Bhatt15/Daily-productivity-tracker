// --- Configuration & Initial Check ---
const API_BASE_URL = 'http://localhost:5000';
const token = localStorage.getItem('authToken');

// If no token exists, redirect the user to the login page immediately.
if (!token) {
    window.location.href = '/login.html';
}

// --- DOM Elements ---
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const logoutBtn = document.getElementById('logout-btn');
const statsContainer = document.getElementById('stats-container');

// --- Reusable API Fetch Function ---
const apiFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An API error occurred');
    }
    // For DELETE requests, there might not be a JSON body to parse
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return;
    }
    return response.json();
};

// --- Specific API Calls ---
const getTasks = () => apiFetch('/api/tasks');
const getStats = () => apiFetch('/api/dashboard/stats');
const createTask = (title) => apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) });
const deleteTask = (id) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
const toggleTask = (id) => apiFetch(`/api/tasks/${id}`, { method: 'PUT' });
const startTimer = (id) => apiFetch(`/api/tasks/${id}/start-timer`, { method: 'PATCH' });
const stopTimer = (id) => apiFetch(`/api/tasks/${id}/stop-timer`, { method: 'PATCH' });

// --- Helper Functions ---
const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

// --- Render Functions (Updating the UI) ---
const renderTasks = (tasks) => {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = '<li><p>No tasks yet. Add one above!</p></li>';
        return;
    }
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task._id;

        const timerButton = task.completed
            ? '' // No timer button for completed tasks
            : task.isRunning
                ? `<button class="timer-btn stop-btn" title="Stop Timer">■</button>`
                : `<button class="timer-btn start-btn" title="Start Timer">▶</button>`;

        li.innerHTML = `
            <div class="task-item-main">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-details">
                    <span class="task-title">${task.title}</span>
                    <div class="task-time">Time spent: ${formatTime(task.timeSpent)}</div>
                </div>
            </div>
            <div class="task-controls">
                ${timerButton}
                <button class="delete-btn" title="Delete Task">&times;</button>
            </div>
        `;
        taskList.appendChild(li);
    });
};

const renderStats = (stats) => {
    statsContainer.innerHTML = `
        <div class="stat-box"><p>Total Tasks</p><span class="stat-number">${stats.totalTasks}</span></div>
        <div class="stat-box"><p>Completed</p><span class="stat-number">${stats.completedTasks}</span></div>
        <div class="stat-box"><p>Pending</p><span class="stat-number">${stats.pendingTasks}</span></div>
        <div class="stat-box"><p>Total Time</p><span class="stat-number">${formatTime(stats.totalTime)}</span></div>
    `;
};

// --- Event Handlers ---
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (title) {
        try {
            await createTask(title);
            taskInput.value = '';
            loadDashboard();
        } catch (error) {
            alert(`Error creating task: ${error.message}`);
        }
    }
});

taskList.addEventListener('click', async (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    const taskId = taskItem.dataset.id;

    try {
        if (e.target.matches('.delete-btn')) await deleteTask(taskId);
        if (e.target.matches('input[type="checkbox"]')) await toggleTask(taskId);
        if (e.target.matches('.start-btn')) await startTimer(taskId);
        if (e.target.matches('.stop-btn')) await stopTimer(taskId);
        
        // Only reload if an action was taken that requires a refresh
        if (e.target.matches('.delete-btn, input[type="checkbox"], .timer-btn')) {
            loadDashboard();
        }
    } catch (error) {
        alert(`Error updating task: ${error.message}`);
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
});

// --- Initial Data Load ---
const loadDashboard = async () => {
    try {
        const [tasks, stats] = await Promise.all([getTasks(), getStats()]);
        renderTasks(tasks);
        renderStats(stats);
    } catch (error) {
        alert(`Failed to load dashboard: ${error.message}`);
    }
};

document.addEventListener('DOMContentLoaded', loadDashboard);

# TaskFlow — Daily Productivity Tracker

A full-stack MERN app for tracking daily tasks, timing focused work sessions, and visualizing your productivity with a live dashboard.

Track what you're working on, run a timer per task, mark things done, and see completion rate, time tracked, and pending work at a glance.

## Features

- 🔐 JWT-based authentication (register/login, protected routes)
- ✅ Create, complete, and delete tasks with optional descriptions
- ⏱️ Per-task timer — start/stop tracking and resume correctly across page refreshes
- 📊 Dashboard with live stats: total tasks, completed, pending, time tracked, completion rate
- 🔍 Filter tasks by all / active / completed
- 🔒 Task ownership enforced server-side — users can only see and modify their own tasks

## Tech Stack

**Frontend:** React 19, Vite, React Router, Axios
**Backend:** Node.js, Express 5, MongoDB, Mongoose
**Auth:** JSON Web Tokens (JWT), bcrypt for password hashing

## Project Structure

```
Daily-productivity-tracker/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handler logic (auth, tasks)
│   ├── middleware/auth.js      # JWT verification (protect middleware)
│   ├── models/                 # Mongoose schemas (User, Task)
│   ├── routes/                 # Express routers
│   └── index.js                # App entry point
└── frontend/
    └── src/
        ├── api/axios.js        # Configured Axios instance + interceptors
        ├── context/AuthContext.jsx  # Auth state (login/register/logout)
        ├── components/         # Navbar, TaskCard, StatsCard, ProtectedRoute
        ├── hooks/useTimer.js    # Client-side timer logic
        └── pages/               # Login, Register, Dashboard, Tasks
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone https://github.com/Shubham-Bhatt15/Daily-productivity-tracker.git
cd Daily-productivity-tracker

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

In `backend/`, copy the example env file and fill in your own values:

```bash
cd backend
cp .env.example .env
```

`.env` requires:

| Variable      | Description                                         | Example                                      |
|---------------|------------------------------------------------------|-----------------------------------------------|
| `MONGO_URI`   | MongoDB connection string                            | `mongodb://localhost:27017/taskflow`          |
| `JWT_SECRET`  | Long random string used to sign JWTs                 | `use a real random string in production`      |
| `PORT`        | Port the API server runs on                          | `5000`                                        |
| `CLIENT_URL`  | Frontend origin, used to restrict CORS in production | `http://localhost:5173`                       |

The frontend reads its API base URL from `VITE_API_URL` (defaults to `http://localhost:5000/api` if unset). To override, create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run it

```bash
# Terminal 1 — backend
cd backend
npm start          # or: node index.js

# Terminal 2 — frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and register a new account to get started.

## API Reference

All routes are prefixed with `/api`. Routes marked 🔒 require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint           | Description                     | Access |
|--------|---------------------|----------------------------------|--------|
| POST   | `/register`         | Create a new account            | Public |
| POST   | `/login`             | Log in, receive a JWT            | Public |
| GET    | `/me`                | Get the current user's profile   | 🔒 |
| GET    | `/validate-token`    | Check if the current token is valid | 🔒 |

### Tasks — `/api/tasks`

| Method | Endpoint              | Description                          | Access |
|--------|-------------------------|----------------------------------------|--------|
| GET    | `/`                     | List all tasks for the current user    | 🔒 |
| POST   | `/`                     | Create a task (`title`, `description`) | 🔒 |
| PUT    | `/:id`                  | Toggle a task's completed state        | 🔒 |
| DELETE | `/:id`                  | Delete a task                          | 🔒 |
| PATCH  | `/:id/time`             | Manually set `timeSpent` (seconds)     | 🔒 |
| PATCH  | `/:id/start-timer`      | Start the timer on a task              | 🔒 |
| PATCH  | `/:id/stop-timer`       | Stop the timer, accumulate time spent  | 🔒 |

### Dashboard — `/api/dashboard`

| Method | Endpoint    | Description                                                    | Access |
|--------|--------------|------------------------------------------------------------------|--------|
| GET    | `/stats`     | Returns `totalTasks`, `completedTasks`, `pendingTasks`, `totalTime` | 🔒 |

All task and dashboard endpoints are scoped to the authenticated user — one account can never read or modify another account's tasks.

## Roadmap / Ideas for Contribution

- [ ] Automated tests (backend: auth + task-ownership; frontend: component tests)
- [ ] CI pipeline (GitHub Actions) running lint + tests on push
- [ ] Weekly/monthly analytics charts on the dashboard
- [ ] Task categories/tags and priority levels
- [ ] Password reset flow
- [ ] Rate limiting on `/api/auth/login` and `/api/auth/register`

Contributions welcome — open an issue or PR.

## License

ISC
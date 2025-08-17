// index.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboard'); 

// --- Environment Variables ---
const PORT = process.env.PORT || 5000;

// --- Initialize Express App ---
const app = express();

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors()); 
// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
// A simple root route to check if the API is running
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Mount the route handlers for different parts of the API
// All auth-related routes (like /login, /register) will be handled by authRoutes
app.use('/api/auth', authRoutes);
// All task-related routes will be handled by taskRoutes
app.use('/api/tasks', taskRoutes);
// All dashboard-related routes will be handled by dashboardRoutes
app.use('/api/dashboard', dashboardRoutes);


// --- Generic Error Handling Middleware ---
// This will catch any errors that occur in the route handlers
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ message: err.message || 'An unexpected error occurred.' });
});

// --- Start Server ---
// Connect to the database first, then start the Express server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
});

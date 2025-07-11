require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// const authRoutes = require('./routes/authRoutes');
// const taskRoutes = require('./routes/taskRoutes');
// const dashboardRoutes = require('./routes/dashboard'); 
const PORT = process.env.PORT || 5000;

const app = express();
app.listen(PORT, () => {
  console.log("server is running")
})

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');  //changes made
});

console.log("hii")
// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/dashboard', dashboardRoutes);  
//           // ✅ route prefix



// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});



connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({ _id: user._id, name: user.name, email, token });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
})


// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("called")

    if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("not exit ")
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log("yups")
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    console.log("jbedjbwe" , token)

    res.status(201).json({ _id: user._id, name, email, token });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
})
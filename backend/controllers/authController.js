const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * @desc    Generate JWT for a user
 * @param   {string} id - The user ID
 * @returns {string} - The generated JSON Web Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  if(!EMAIL_REGEX.test(normalizedEmail)){
    return res.status(400).json({ message: 'Please provide a valid email address'});
  }
  if(password.length<6){
    return res.status(400).json({message: 'Password must be at least 6 characters'})
  }
  try {
    const userExists = await User.findOne({ email:normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name:name.trim(), email:normalizedEmail, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    console.error(err);
    if(err.name==='ValidationError'){
      const message = Object.values(err.errors)[0]?.message || 'Invalid user data';
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return res.status(400).json({message: 'Please provide email and password'});
  }

  try {
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get current user data
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  // The 'protect' middleware already found the user and attached it to req.user
  res.status(200).json(req.user);
};

/**
 * @desc    Validate user token
 * @route   GET /api/auth/validate-token
 * @access  Private
 */
const validateToken = (req, res) => {
  // If the 'protect' middleware passed, the token is valid.
  res.status(200).json({ message: 'Token is valid' });
};




// --- EXPORTS ---
// This line makes all the functions available to other files.
module.exports = {
  registerUser,
  loginUser,
  getMe,
  validateToken,
};

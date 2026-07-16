const rateLimit = require('express-rate-limit');

// Skip rate limiting entirely during tests — the test suite legitimately
// calls /register and /login far more than 10 times per run (fresh users
// per test), and getting 429'd mid-suite has nothing to do with what the
// tests are actually checking.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

module.exports = { authLimiter };
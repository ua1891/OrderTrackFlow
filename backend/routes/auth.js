const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById } = require('../services/authService');
const authenticateToken = require('../middleware/auth');
const { sendError, sendSuccess } = require('../utils/apiError');

// Verify token and return current user (used on app load)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    return sendSuccess(res, { user });
  } catch (err) {
    const status = err.message === 'User not found.' ? 404 : 500;
    return sendError(res, status, err.message);
  }
});

router.post('/register', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return sendError(res, 400, 'Name and email are required.');
  }

  try {
    const data = await registerUser(name, email);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }

  try {
    const data = await loginUser(email, password);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, 401, err.message);
  }
});

module.exports = router;

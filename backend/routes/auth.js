const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById } = require('../services/authService');
const authenticateToken = require('../middleware/auth');

// Verify token and return current user (used on app load)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    const status = err.message === 'User not found.' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const data = await registerUser(name, email);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const data = await loginUser(email, password);
    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;

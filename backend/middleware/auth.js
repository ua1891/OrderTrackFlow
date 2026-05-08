const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiError');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trackflow_key_123';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return sendError(res, 401, 'Access token required.');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return sendError(res, 403, 'Invalid or expired token.');
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;

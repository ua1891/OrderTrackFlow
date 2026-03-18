const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendWelcomeEmail } = require('./email');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trackflow_key_123';

async function registerUser(name, email) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists with this email.');

  // Generate a robust 8-character password
  const generatedPassword = crypto.randomBytes(4).toString('hex');
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);
  
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  // Send Welcome Email containing the plaintext password
  sendWelcomeEmail(user, generatedPassword);

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password.');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error('Invalid email or password.');

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

module.exports = { registerUser, loginUser };

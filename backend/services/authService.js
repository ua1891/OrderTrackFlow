const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { sendWelcomeEmail } = require('./email');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trackflow_key_123';

async function registerUser(name, email) {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('Invalid email format.');

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists with this email.');

  // Generate a robust 8-character password
  const generatedPassword = crypto.randomBytes(4).toString('hex');
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);
  
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  });

  let token;
  try {
    token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    
    // Send Welcome Email containing the plaintext password
    await sendWelcomeEmail(user, generatedPassword);
  } catch (error) {
    // If email fails, rollback (delete the user) so they aren't stuck without a password
    await prisma.user.delete({ where: { id: user.id } });
    console.error("Signup Email Error:", error);
    throw new Error("Account creation failed: Could not send the welcome email. Please check email settings.");
  }

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

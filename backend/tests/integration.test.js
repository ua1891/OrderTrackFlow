process.env.DATABASE_URL = 'file:./test.db';
const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');

// Mock poller and cron jobs to prevent background tasks during tests
jest.mock('../services/poller', () => ({
  initializePoller: jest.fn(),
  startConfirmationReminderCron: jest.fn()
}));

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  shopifyOrder: {
    findMany: jest.fn(),
  }
}));

// Mock email service
jest.mock('../services/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

describe('Integration Tests - API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/register - Success', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  test('POST /api/auth/login - Success', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
      password: require('bcryptjs').hashSync('password123', 10)
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });

  test('GET /api/orders/dashboard - Unauthorized without token', async () => {
    const response = await request(app).get('/api/orders/dashboard');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Access token required.');
  });
});

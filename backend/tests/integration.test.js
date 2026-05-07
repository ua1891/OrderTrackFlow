const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');

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

// Mock email service to avoid sending real emails during tests
jest.mock('../services/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

describe('Integration Tests - Auth Routes', () => {
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
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('POST /api/auth/register - Missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Name and email are required.');
  });
});

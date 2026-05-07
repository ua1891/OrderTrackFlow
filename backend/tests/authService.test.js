const { registerUser, loginUser } = require('../services/authService');
const prisma = require('../utils/prisma');

// Mock Prisma and email service
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../services/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

describe('authService - registerUser', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects invalid email format', async () => {
    await expect(registerUser('Test', 'not-an-email'))
      .rejects.toThrow('Invalid email format.');
  });

  test('rejects duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com' });
    await expect(registerUser('Test', 'a@b.com'))
      .rejects.toThrow('User already exists with this email.');
  });

  test('creates user and returns token on valid input', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'uuid-1', name: 'Test', email: 'test@test.com', password: 'hashed' });
    const result = await registerUser('Test', 'test@test.com');
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('test@test.com');
  });
});

describe('authService - loginUser', () => {
  test('throws on unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(loginUser('x@x.com', 'pass'))
      .rejects.toThrow('Invalid email or password.');
  });
});

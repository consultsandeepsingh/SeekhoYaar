import supertest from 'supertest';
import app from '../app';

const request = supertest(app.callback());

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new student successfully', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        email: 'test@student.com',
        password: 'Password@123',
        name: 'Rahul Kumar',
        college: 'IIT Delhi',
        branch: 'Computer Science',
        semester: 3,
        phone: '9876543210',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 422 for invalid data', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        email: 'invalid-email',
        password: '123',
      });

      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        email: 'duplicate@student.com',
        password: 'Password@123',
        name: 'Test User',
        college: 'BITS',
        branch: 'ECE',
        semester: 1,
      };

      await request.post('/api/v1/auth/register').send(userData);
      const res = await request.post('/api/v1/auth/register').send(userData);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'test@student.com',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'test@student.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
    });
  });
});
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  const testUser = {
    username: 'testuser',
    password: 'TestPass123!',
    displayName: 'Test User',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.error).toContain('exists');
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, username: 'testuser2', password: '123' })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser3' })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: testUser.username, password: testUser.password })
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: testUser.username, password: 'wrongpass' })
        .expect(401);

      expect(res.body.error).toContain('Invalid');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'pass' })
        .expect(401);

      expect(res.body.error).toContain('Invalid');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: reg.body.refreshToken })
        .expect(200);

      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body.error).toContain('Invalid');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`)
        .expect(200);

      expect(res.body.id).toBeDefined();
      expect(res.body.username).toBe(testUser.username);
    });

    it('should reject missing token', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);
      expect(res.body.error).toContain('Unauthorized');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and invalidate token', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${reg.body.token}`)
        .expect(200);

      const me = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`)
        .expect(401);

      expect(me.body.error).toContain('Unauthorized');
    });
  });

  describe('POST /api/auth/logout-all', () => {
    it('should logout all sessions', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);

      // Login again to create second session
      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ username: testUser.username, password: testUser.password });

      await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${reg.body.token}`)
        .expect(200);

      // Both tokens should be invalid
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`)
        .expect(401);

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${login2.body.token}`)
        .expect(401);
    });
  });
});

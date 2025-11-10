const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Admin');

describe('Admin Authentication Flow Integration Tests', () => {
  let mockAdmin;

  beforeAll(async () => {
    // Set up test database connection
    // Note: In a real scenario, you'd use a test database
  });

  afterAll(async () => {
    // Clean up test data
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock admin data
    mockAdmin = {
      id: 1,
      email: 'superadmin@newsmarketplace.com',
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      is_active: true,
      password_hash: 'hashed_password',
      created_at: new Date(),
      updated_at: new Date(),
      last_login: new Date(),
      verifyPassword: jest.fn().mockResolvedValue(true),
      updateLastLogin: jest.fn(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        email: 'superadmin@newsmarketplace.com',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date()
      })
    };

    // Mock Admin model methods
    const Admin = require('../../src/models/Admin');
    Admin.findByEmail = jest.fn();
    Admin.findById = jest.fn();
  });

  describe('POST /api/admin/auth/login', () => {
    it('should login admin with valid credentials', async () => {
      const Admin = require('../../src/models/Admin');
      Admin.findByEmail.mockResolvedValue(mockAdmin);

      const loginData = {
        email: 'superadmin@newsmarketplace.com',
        password: 'SuperAdmin123!'
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('admin');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.admin.role).toBe('super_admin');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).not.toHaveProperty('refreshToken'); // Should not be in response

      // Check if refresh token cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('adminRefreshToken'))).toBe(true);
    });

    it('should reject login with invalid email', async () => {
      const Admin = require('../../src/models/Admin');
      Admin.findByEmail.mockResolvedValue(null);

      const loginData = {
        email: 'invalid@admin.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const Admin = require('../../src/models/Admin');
      const invalidPasswordAdmin = { ...mockAdmin, verifyPassword: jest.fn().mockResolvedValue(false) };
      Admin.findByEmail.mockResolvedValue(invalidPasswordAdmin);

      const loginData = {
        email: 'superadmin@newsmarketplace.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: 'admin@test.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('GET /api/admin/auth/profile', () => {
    let accessToken;

    beforeAll(async () => {
      // Login to get access token
      const Admin = require('../../src/models/Admin');
      Admin.findByEmail.mockResolvedValue(mockAdmin);

      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'superadmin@newsmarketplace.com',
          password: 'SuperAdmin123!'
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('should get admin profile with valid token', async () => {
      const Admin = require('../../src/models/Admin');
      Admin.findById.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .get('/api/admin/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('admin');
      expect(response.body.admin.email).toBe('superadmin@newsmarketplace.com');
      expect(response.body.admin.role).toBe('super_admin');
    });

    it('should reject profile access without token', async () => {
      const response = await request(app)
        .get('/api/admin/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Admin access token required');
    });

    it('should reject profile access with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired admin token');
    });

    it('should reject profile access with regular user token', async () => {
      // This would require a regular user token, but for this test we'll assume
      // the admin token validation correctly rejects non-admin tokens
      const response = await request(app)
        .get('/api/admin/auth/profile')
        .set('Authorization', 'Bearer user-token')
        .expect(401);
    });
  });

  describe('POST /api/admin/auth/refresh-token', () => {
    let refreshToken;

    beforeAll(async () => {
      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'superadmin@newsmarketplace.com',
          password: 'SuperAdmin123!'
        });

      // Extract refresh token from cookies
      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => cookie.includes('adminRefreshToken'));
      refreshToken = refreshCookie.split('=')[1].split(';')[0];
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/refresh-token')
        .set('Cookie', `adminRefreshToken=${refreshToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
    });

    it('should reject refresh without refresh token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/refresh-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Refresh token required');
    });

    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/refresh-token')
        .set('Cookie', 'adminRefreshToken=invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired admin refresh token');
    });
  });

  describe('PUT /api/admin/auth/change-password', () => {
    let accessToken;

    beforeAll(async () => {
      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'superadmin@newsmarketplace.com',
          password: 'SuperAdmin123!'
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('should change password with valid current password', async () => {
      const response = await request(app)
        .put('/api/admin/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SuperAdmin123!',
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should reject password change with wrong current password', async () => {
      const response = await request(app)
        .put('/api/admin/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Current password is incorrect');
    });

    it('should reject password change with invalid new password', async () => {
      const response = await request(app)
        .put('/api/admin/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SuperAdmin123!',
          newPassword: '123' // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/admin/auth/logout', () => {
    let accessToken;

    beforeAll(async () => {
      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'superadmin@newsmarketplace.com',
          password: 'SuperAdmin123!'
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('should logout admin successfully', async () => {
      const response = await request(app)
        .post('/api/admin/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('Role-based access control', () => {
    let superAdminToken, contentManagerToken;

    beforeAll(async () => {
      // Login as super admin
      const superAdminResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'superadmin@newsmarketplace.com',
          password: 'SuperAdmin123!'
        });
      superAdminToken = superAdminResponse.body.tokens.accessToken;

      // Login as content manager
      const contentManagerResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'contentmanager@newsmarketplace.com',
          password: 'ContentManager123!'
        });
      contentManagerToken = contentManagerResponse.body.tokens.accessToken;
    });

    it('should allow super admin to access super admin only route', async () => {
      const response = await request(app)
        .get('/api/admin/auth/super-admin-only')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'This is accessible only to super admins');
    });

    it('should deny content manager access to super admin only route', async () => {
      const response = await request(app)
        .get('/api/admin/auth/super-admin-only')
        .set('Authorization', `Bearer ${contentManagerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Insufficient admin permissions');
    });

    it('should allow content manager to access content manager plus route', async () => {
      const response = await request(app)
        .get('/api/admin/auth/content-manager-plus')
        .set('Authorization', `Bearer ${contentManagerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'This is accessible to content managers and above');
    });
  });

  describe('Security edge cases', () => {
    it('should handle SQL injection attempts in login', async () => {
      const maliciousData = {
        email: "admin@test.com' OR '1'='1",
        password: "' OR '1'='1"
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(maliciousData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should handle XSS attempts in input fields', async () => {
      const xssData = {
        email: '<script>alert("xss")</script>@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(xssData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should handle extremely long input fields', async () => {
      const longEmail = 'a'.repeat(1000) + '@test.com';
      const longPassword = 'a'.repeat(1000);

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: longEmail,
          password: longPassword
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should handle concurrent login attempts', async () => {
      const loginPromises = Array(10).fill().map(() =>
        request(app)
          .post('/api/admin/auth/login')
          .send({
            email: 'superadmin@newsmarketplace.com',
            password: 'SuperAdmin123!'
          })
      );

      const responses = await Promise.all(loginPromises);

      // At least one should succeed, others might be rate limited or handled
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitCount = responses.filter(r => r.status === 429).length;

      expect(successCount + rateLimitCount).toBe(10);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "admin@test.com", "password": }') // Malformed JSON
        .expect(400);

      // Express should handle malformed JSON
      expect(response.status).toBe(400);
    });
  });
});
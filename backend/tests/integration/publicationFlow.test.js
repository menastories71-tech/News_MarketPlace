const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Publication');
jest.mock('../../src/models/User');
jest.mock('../../src/services/emailService');

describe('Publication Management Flow Integration Tests', () => {
  let mockUser, mockPublication, mockAdmin;

  beforeAll(async () => {
    // Set up test database connection
    // Note: In a real scenario, you'd use a test database
  });

  afterAll(async () => {
    // Clean up test data
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock user data
    mockUser = {
      id: 1,
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_verified: true,
      is_active: true,
      role: 'user',
      verifyPassword: jest.fn().mockResolvedValue(true),
      updateLastLogin: jest.fn(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true,
        is_active: true,
        role: 'user'
      })
    };

    // Mock admin data
    mockAdmin = {
      id: 1,
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'super_admin',
      is_active: true,
      verifyPassword: jest.fn().mockResolvedValue(true),
      updateLastLogin: jest.fn(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'super_admin',
        is_active: true
      })
    };

    // Mock publication data
    mockPublication = {
      id: 1,
      title: 'Test Publication',
      content: 'This is a test publication content',
      author_name: 'John Doe',
      author_email: 'user@example.com',
      status: 'pending',
      category: 'News',
      tags: ['test', 'publication'],
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        title: 'Test Publication',
        content: 'This is a test publication content',
        author_name: 'John Doe',
        author_email: 'user@example.com',
        status: 'pending',
        category: 'News',
        tags: ['test', 'publication'],
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      })
    };

    // Mock models
    const Publication = require('../../src/models/Publication');
    const User = require('../../src/models/User');

    Publication.create = jest.fn();
    Publication.findById = jest.fn();
    Publication.findAll = jest.fn();
    Publication.findByUserId = jest.fn();
    Publication.update = jest.fn();
    Publication.delete = jest.fn();
    Publication.findByStatus = jest.fn();
    Publication.findByCategory = jest.fn();
    Publication.search = jest.fn();

    User.findByEmail = jest.fn();
    User.findById = jest.fn();
  });

  describe('POST /api/publications', () => {
    it('should create a new publication successfully', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublication);

      const publicationData = {
        group_id: 1,
        publication_sn: 'TEST001',
        publication_grade: 'A',
        publication_name: 'Test Publication',
        publication_website: 'https://test.com',
        publication_price: 100.00,
        agreement_tat: 5,
        practical_tat: 7,
        publication_language: 'English',
        publication_region: 'Global',
        publication_primary_industry: 'Technology',
        website_news_index: 50,
        da: 25,
        dr: 30,
        words_limit: 1000,
        number_of_images: 5
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(publicationData)
        .expect(201);

      expect(response.body).toHaveProperty('publication');
      expect(response.body.publication.publication_name).toBe('Test Publication');
      expect(response.body.publication.status).toBe('draft');
      expect(Publication.create).toHaveBeenCalledWith({
        ...publicationData,
        submitted_by: 1,
        status: 'draft'
      });
    });

    it('should reject publication creation without authentication', async () => {
      const response = await request(app)
        .post('/api/publications')
        .send({
          title: 'Test Publication',
          content: 'Content'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ title: 'Test' }) // Missing content
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('GET /api/publications', () => {
    it('should get all publications for admin', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue([mockPublication]);

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('publications');
      expect(Array.isArray(response.body.publications)).toBe(true);
      expect(Publication.findAll).toHaveBeenCalled();
    });

    it('should get user publications for regular user', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findByUserId.mockResolvedValue([mockPublication]);

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .expect(200);

      expect(response.body).toHaveProperty('publications');
      expect(Publication.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should filter publications by status', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findByStatus.mockResolvedValue([mockPublication]);

      const response = await request(app)
        .get('/api/publications?status=pending')
        .set('Authorization', 'Bearer mock-admin-token')
        .expect(200);

      expect(Publication.findByStatus).toHaveBeenCalledWith('pending');
    });

    it('should filter publications by category', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findByCategory.mockResolvedValue([mockPublication]);

      const response = await request(app)
        .get('/api/publications?category=News')
        .set('Authorization', 'Bearer mock-admin-token')
        .expect(200);

      expect(Publication.findByCategory).toHaveBeenCalledWith('News');
    });

    it('should search publications', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.search.mockResolvedValue([mockPublication]);

      const response = await request(app)
        .get('/api/publications?search=test')
        .set('Authorization', 'Bearer mock-admin-token')
        .expect(200);

      expect(Publication.search).toHaveBeenCalledWith('test');
    });
  });

  describe('GET /api/publications/:id', () => {
    it('should get publication by ID', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockResolvedValue(mockPublication);

      const response = await request(app)
        .get('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .expect(200);

      expect(response.body).toHaveProperty('publication');
      expect(response.body.publication.id).toBe(1);
      expect(Publication.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent publication', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/publications/999')
        .set('Authorization', 'Bearer mock-user-token')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Publication not found');
    });
  });

  describe('PUT /api/publications/:id', () => {
    it('should update publication successfully', async () => {
      const Publication = require('../../src/models/Publication');
      const updatedPublication = { ...mockPublication, title: 'Updated Title' };
      Publication.findById.mockResolvedValue(mockPublication);
      Publication.update.mockResolvedValue(updatedPublication);

      const response = await request(app)
        .put('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body).toHaveProperty('publication');
      expect(response.body.publication.title).toBe('Updated Title');
      expect(Publication.update).toHaveBeenCalled();
    });

    it('should reject update of another user publication', async () => {
      const Publication = require('../../src/models/Publication');
      const otherUserPublication = { ...mockPublication, user_id: 2 };
      Publication.findById.mockResolvedValue(otherUserPublication);

      const response = await request(app)
        .put('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('DELETE /api/publications/:id', () => {
    it('should delete publication successfully', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockResolvedValue(mockPublication);
      Publication.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Publication deleted successfully');
      expect(Publication.delete).toHaveBeenCalledWith(1);
    });

    it('should reject delete of another user publication', async () => {
      const Publication = require('../../src/models/Publication');
      const otherUserPublication = { ...mockPublication, user_id: 2 };
      Publication.findById.mockResolvedValue(otherUserPublication);

      const response = await request(app)
        .delete('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('PUT /api/publications/:id/status', () => {
    it('should allow admin to approve publication', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockResolvedValue(mockPublication);
      Publication.update.mockResolvedValue({ ...mockPublication, status: 'approved' });

      const response = await request(app)
        .put('/api/publications/1/status')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body).toHaveProperty('publication');
      expect(response.body.publication.status).toBe('approved');
    });

    it('should reject status update for non-admin users', async () => {
      const response = await request(app)
        .put('/api/publications/1/status')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ status: 'approved' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin access required');
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk status update', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.update.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/bulk/status')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          publicationIds: [1, 2, 3],
          status: 'approved'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Bulk status update completed');
    });

    it('should handle bulk delete', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.delete.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/bulk/delete')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          publicationIds: [1, 2, 3]
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Bulk delete completed');
    });
  });

  describe('Security and Edge Cases', () => {
    it('should handle SQL injection attempts', async () => {
      const maliciousData = {
        title: "'; DROP TABLE publications; --",
        content: 'Content'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(maliciousData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle XSS attempts', async () => {
      const xssData = {
        title: '<script>alert("xss")</script>Test',
        content: 'Content'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(xssData)
        .expect(201);

      // Should be sanitized
      expect(response.body.publication.title).not.toContain('<script>');
    });

    it('should handle oversized content', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB content

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({
          title: 'Test',
          content: largeContent
        })
        .expect(413); // Payload too large

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .set('Content-Type', 'application/json')
        .send('{invalid json')
        .expect(400);

      expect(response.status).toBe(400);
    });
  });
});
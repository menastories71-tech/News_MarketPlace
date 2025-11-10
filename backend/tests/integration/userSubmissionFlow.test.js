const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Publication');
jest.mock('../../src/models/User');
jest.mock('../../src/services/recaptchaService');
jest.mock('../../src/services/emailService');

describe('User Submission Form Flow Integration Tests', () => {
  let mockUser, mockPublication;

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

    // Mock publication data
    mockPublication = {
      id: 1,
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
      number_of_images: 5,
      submitted_by: 1,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
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
        number_of_images: 5,
        submitted_by: 1,
        status: 'draft',
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
    Publication.update = jest.fn();

    User.findByEmail = jest.fn();
    User.findById = jest.fn();
  });

  describe('Publication Submission with reCAPTCHA', () => {
    it('should accept publication submission with valid reCAPTCHA', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const recaptchaService = require('../../src/services/recaptchaService');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublication);
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9); // Valid score

      const submissionData = {
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
        number_of_images: 5,
        recaptchaToken: 'valid-recaptcha-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(submissionData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('publication');
      expect(response.body.publication.status).toBe('draft');
      expect(recaptchaService.verifyRecaptcha).toHaveBeenCalledWith('valid-recaptcha-token');
    });

    it('should reject submission with invalid reCAPTCHA', async () => {
      const recaptchaService = require('../../src/services/recaptchaService');
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.3); // Invalid score

      const submissionData = {
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
        number_of_images: 5,
        recaptchaToken: 'invalid-recaptcha-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(submissionData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'reCAPTCHA verification failed. Please try again.');
      expect(recaptchaService.verifyRecaptcha).toHaveBeenCalledWith('invalid-recaptcha-token');
    });

    it('should reject submission without reCAPTCHA token', async () => {
      const submissionData = {
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
        // Missing recaptchaToken
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(submissionData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'reCAPTCHA token is required'
          })
        ])
      );
    });

    it('should handle reCAPTCHA service errors gracefully', async () => {
      const recaptchaService = require('../../src/services/recaptchaService');
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(null); // Service error

      const submissionData = {
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
        number_of_images: 5,
        recaptchaToken: 'error-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(submissionData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'reCAPTCHA verification failed. Please try again.');
    });
  });

  describe('Rate Limiting on Publication Submissions', () => {
    it('should enforce rate limiting on publication submissions', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const recaptchaService = require('../../src/services/recaptchaService');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublication);
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9);

      const submissionData = {
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
        number_of_images: 5,
        recaptchaToken: 'valid-token'
      };

      // Make multiple rapid requests
      const requests = Array(15).fill().map(() =>
        request(app)
          .post('/api/publications')
          .set('Authorization', 'Bearer mock-user-token')
          .send(submissionData)
      );

      const responses = await Promise.all(requests);

      // Some should succeed, some should be rate limited
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitCount = responses.filter(r => r.status === 429).length;

      expect(successCount + rateLimitCount).toBe(15);
      expect(rateLimitCount).toBeGreaterThan(0); // At least some should be rate limited
    });

    it('should allow different users to submit without rate limiting each other', async () => {
      const Publication = require('../../src/models/Publication');
      const recaptchaService = require('../../src/services/recaptchaService');

      // Mock different users
      const user1 = { ...mockUser, id: 1, email: 'user1@example.com' };
      const user2 = { ...mockUser, id: 2, email: 'user2@example.com' };

      Publication.create.mockResolvedValue(mockPublication);
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9);

      const submissionData1 = {
        group_id: 1,
        publication_sn: 'TEST001',
        publication_grade: 'A',
        publication_name: 'Test Publication 1',
        publication_website: 'https://test1.com',
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
        number_of_images: 5,
        recaptchaToken: 'valid-token-1'
      };

      const submissionData2 = {
        group_id: 1,
        publication_sn: 'TEST002',
        publication_grade: 'A',
        publication_name: 'Test Publication 2',
        publication_website: 'https://test2.com',
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
        number_of_images: 5,
        recaptchaToken: 'valid-token-2'
      };

      // Both users should be able to submit without rate limiting each other
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/publications')
          .set('Authorization', 'Bearer mock-user1-token')
          .send(submissionData1),
        request(app)
          .post('/api/publications')
          .set('Authorization', 'Bearer mock-user2-token')
          .send(submissionData2)
      ]);

      // Both should succeed (assuming rate limits are per-user)
      expect([200, 201]).toContain(response1.status);
      expect([200, 201]).toContain(response2.status);
    });
  });

  describe('Form Validation and Data Sanitization', () => {
    it('should validate all required fields', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({
          recaptchaToken: 'valid-token'
          // Missing all required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it('should validate email format in publication data', async () => {
      // Note: Publication model doesn't have email validation, but let's test general validation
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({
          group_id: 1,
          publication_sn: 'TEST001',
          publication_grade: 'A',
          publication_name: 'Test Publication',
          publication_website: 'invalid-url', // Invalid URL
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
          number_of_images: 5,
          recaptchaToken: 'valid-token'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should validate numeric fields', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({
          group_id: 'not-a-number', // Should be integer
          publication_sn: 'TEST001',
          publication_grade: 'A',
          publication_name: 'Test Publication',
          publication_website: 'https://test.com',
          publication_price: 'not-a-number', // Should be float
          agreement_tat: 'not-a-number', // Should be integer
          practical_tat: 7,
          publication_language: 'English',
          publication_region: 'Global',
          publication_primary_industry: 'Technology',
          website_news_index: 50,
          da: 25,
          dr: 30,
          words_limit: 1000,
          number_of_images: 5,
          recaptchaToken: 'valid-token'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should validate field ranges', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({
          group_id: 1,
          publication_sn: 'TEST001',
          publication_grade: 'A',
          publication_name: 'Test Publication',
          publication_website: 'https://test.com',
          publication_price: -100.00, // Should be positive
          agreement_tat: -5, // Should be non-negative
          practical_tat: 7,
          publication_language: 'English',
          publication_region: 'Global',
          publication_primary_industry: 'Technology',
          website_news_index: 50,
          da: 150, // Should be <= 100
          dr: 30,
          words_limit: 1000,
          number_of_images: 5,
          recaptchaToken: 'valid-token'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should sanitize and handle special characters', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const recaptchaService = require('../../src/services/recaptchaService');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublication);
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9);

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send({
          group_id: 1,
          publication_sn: 'TEST001',
          publication_grade: 'A',
          publication_name: 'Test Publication & "Special" <Chars> ©™',
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
          number_of_images: 5,
          recaptchaToken: 'valid-token'
        })
        .expect(201);

      expect(response.body).toHaveProperty('publication');
      expect(Publication.create).toHaveBeenCalled();
    });
  });

  describe('User Submission Workflow', () => {
    it('should create publication in draft status for user submissions', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const recaptchaService = require('../../src/services/recaptchaService');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublication);
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9);

      const submissionData = {
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
        number_of_images: 5,
        recaptchaToken: 'valid-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(submissionData)
        .expect(201);

      expect(response.body.publication.status).toBe('draft');
      expect(response.body.message).toContain('pending review');
    });

    it('should allow users to update their draft publications', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockResolvedValue(mockPublication);
      Publication.update.mockResolvedValue({ ...mockPublication, publication_name: 'Updated Name' });

      const response = await request(app)
        .put('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ publication_name: 'Updated Name' })
        .expect(200);

      expect(response.body).toHaveProperty('publication');
      expect(response.body.publication.publication_name).toBe('Updated Name');
    });

    it('should prevent users from updating approved publications', async () => {
      const Publication = require('../../src/models/Publication');
      const approvedPublication = { ...mockPublication, status: 'approved' };
      Publication.findById.mockResolvedValue(approvedPublication);

      const response = await request(app)
        .put('/api/publications/1')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ publication_name: 'Updated Name' })
        .expect(400); // Assuming business rule prevents this

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Security and Edge Cases', () => {
    it('should handle SQL injection attempts in form fields', async () => {
      const maliciousData = {
        group_id: 1,
        publication_sn: "'; DROP TABLE publications; --",
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
        number_of_images: 5,
        recaptchaToken: 'valid-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(maliciousData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle XSS attempts in form fields', async () => {
      const xssData = {
        group_id: 1,
        publication_sn: 'TEST001',
        publication_grade: 'A',
        publication_name: '<script>alert("xss")</script>Test Publication',
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
        number_of_images: 5,
        recaptchaToken: 'valid-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(xssData)
        .expect(201);

      // Should be sanitized
      expect(response.body.publication.publication_name).not.toContain('<script>');
    });

    it('should handle oversized form data', async () => {
      const largeData = {
        group_id: 1,
        publication_sn: 'x'.repeat(1000), // Very long string
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
        number_of_images: 5,
        recaptchaToken: 'valid-token'
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .send(largeData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should handle malformed JSON in submission', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-user-token')
        .set('Content-Type', 'application/json')
        .send('{invalid json')
        .expect(400);

      expect(response.status).toBe(400);
    });

    it('should handle concurrent submissions from same user', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const recaptchaService = require('../../src/services/recaptchaService');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublication);
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9);

      const submissionData = {
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
        number_of_images: 5,
        recaptchaToken: 'valid-token'
      };

      const concurrentRequests = Array(5).fill().map(() =>
        request(app)
          .post('/api/publications')
          .set('Authorization', 'Bearer mock-user-token')
          .send(submissionData)
      );

      const responses = await Promise.all(concurrentRequests);

      // Some should succeed, some might be rate limited
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitCount = responses.filter(r => r.status === 429).length;
      const errorCount = responses.filter(r => r.status >= 400 && r.status !== 429).length;

      expect(successCount + rateLimitCount + errorCount).toBe(5);
    });
  });
});
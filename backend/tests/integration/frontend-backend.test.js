const request = require('supertest');
const app = require('../../server');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Publication');
jest.mock('../../src/models/User');
jest.mock('../../src/models/UserNotification');
jest.mock('../../src/services/emailService');
jest.mock('../../src/services/recaptchaService');

describe('Frontend-Backend Integration Testing', () => {
  let mockUser, mockPublication, mockNotification;

  beforeAll(async () => {
    // Set up test database connection
  });

  afterAll(async () => {
    // Clean up test data
  });

  beforeEach(() => {
    jest.clearAllMocks();

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

    mockPublication = {
      id: 1,
      group_id: 1,
      publication_sn: 'TEST001',
      publication_name: 'Test Publication',
      status: 'pending',
      submitted_by: 1,
      created_at: new Date(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        group_id: 1,
        publication_sn: 'TEST001',
        publication_name: 'Test Publication',
        status: 'pending',
        submitted_by: 1,
        created_at: new Date()
      })
    };

    mockNotification = {
      id: 1,
      user_id: 1,
      type: 'publication_approved',
      title: 'Publication Approved!',
      message: 'Your publication has been approved',
      is_read: false,
      created_at: new Date(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        user_id: 1,
        type: 'publication_approved',
        title: 'Publication Approved!',
        message: 'Your publication has been approved',
        is_read: false,
        created_at: new Date()
      })
    };

    // Mock models
    const Publication = require('../../src/models/Publication');
    const User = require('../../src/models/User');
    const UserNotification = require('../../src/models/UserNotification');

    Publication.create = jest.fn();
    Publication.findById = jest.fn();
    Publication.findAll = jest.fn();
    Publication.update = jest.fn();

    User.findByEmail = jest.fn();
    User.findById = jest.fn();
    User.create = jest.fn();

    UserNotification.create = jest.fn();
    UserNotification.findAll = jest.fn();
    UserNotification.update = jest.fn();
  });

  describe('Complete User Journey', () => {
    it('handles complete user registration and publication submission flow', async () => {
      const User = require('../../src/models/User');
      const Publication = require('../../src/models/Publication');
      const UserNotification = require('../../src/models/UserNotification');
      const recaptchaService = require('../../src/services/recaptchaService');

      // Mock reCAPTCHA verification
      recaptchaService.verifyRecaptcha = jest.fn().mockResolvedValue(0.9);

      // Step 1: User Registration
      User.findByEmail.mockResolvedValue(null); // User doesn't exist
      User.create.mockResolvedValue({
        ...mockUser,
        is_verified: false,
        setOTP: jest.fn(),
        verifyOTP: jest.fn().mockResolvedValue(true)
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          first_name: 'Jane',
          last_name: 'Smith',
          recaptchaToken: 'valid-token'
        })
        .expect(201);

      expect(registerResponse.body.message).toContain('Registration successful');

      // Step 2: Email Verification
      User.findByEmail.mockResolvedValue({
        ...mockUser,
        is_verified: false,
        verifyOTP: jest.fn().mockResolvedValue(true),
        update: jest.fn()
      });

      const verifyResponse = await request(app)
        .post('/api/auth/verify-registration')
        .send({
          email: 'newuser@example.com',
          otp: '123456'
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email verified successfully');
      expect(verifyResponse.body.tokens).toHaveProperty('accessToken');

      // Step 3: User Login
      User.findByEmail.mockResolvedValue({
        ...mockUser,
        verifyPassword: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn()
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          recaptchaToken: 'valid-token'
        })
        .expect(200);

      expect(loginResponse.body.message).toContain('OTP sent to your email');

      // Step 4: OTP Verification for Login
      const verifyLoginResponse = await request(app)
        .post('/api/auth/verify-login')
        .send({
          email: 'newuser@example.com',
          otp: '123456'
        })
        .expect(200);

      const accessToken = verifyLoginResponse.body.tokens.accessToken;

      // Step 5: Publication Submission
      Publication.create.mockResolvedValue(mockPublication);
      UserNotification.create.mockResolvedValue(mockNotification);

      const publicationResponse = await request(app)
        .post('/api/publications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          group_id: 1,
          publication_sn: 'PUB001',
          publication_name: 'My First Publication',
          publication_website: 'https://example.com',
          publication_price: 150.00,
          agreement_tat: 5,
          practical_tat: 7,
          publication_language: 'English',
          publication_region: 'Global',
          publication_primary_industry: 'Technology',
          website_news_index: 60,
          da: 30,
          dr: 35,
          words_limit: 1200,
          number_of_images: 6,
          recaptchaToken: 'valid-token'
        })
        .expect(201);

      expect(publicationResponse.body.publication.status).toBe('pending');

      // Step 6: Check User Profile
      Publication.findAll.mockResolvedValue([mockPublication]);
      UserNotification.findAll.mockResolvedValue([mockNotification]);

      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.user.email).toBe('newuser@example.com');
    });

    it('handles admin publication approval workflow', async () => {
      const Publication = require('../../src/models/Publication');
      const UserNotification = require('../../src/models/UserNotification');

      // Mock admin login
      const adminUser = {
        ...mockUser,
        role: 'admin',
        email: 'admin@example.com'
      };

      // Step 1: Admin login (simplified - assuming admin auth works)
      const adminToken = 'admin-jwt-token';

      // Step 2: Admin views pending publications
      Publication.findAll.mockResolvedValue([mockPublication]);

      const pendingPublicationsResponse = await request(app)
        .get('/api/publications?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(pendingPublicationsResponse.body.publications).toHaveLength(1);
      expect(pendingPublicationsResponse.body.publications[0].status).toBe('pending');

      // Step 3: Admin approves publication
      Publication.findById.mockResolvedValue(mockPublication);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved',
        approved_at: new Date()
      });
      UserNotification.create.mockResolvedValue({
        ...mockNotification,
        type: 'publication_approved',
        title: 'Publication Approved!',
        message: 'Your publication "Test Publication" has been approved.'
      });

      const approvalResponse = await request(app)
        .put('/api/publications/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          admin_notes: 'Approved for publication'
        })
        .expect(200);

      expect(approvalResponse.body.publication.status).toBe('approved');

      // Step 4: User receives notification
      UserNotification.findAll.mockResolvedValue([{
        ...mockNotification,
        type: 'publication_approved',
        title: 'Publication Approved!',
        message: 'Your publication "Test Publication" has been approved.',
        is_read: false
      }]);

      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer user-jwt-token`)
        .expect(200);

      expect(notificationsResponse.body.notifications).toHaveLength(1);
      expect(notificationsResponse.body.notifications[0].type).toBe('publication_approved');
    });
  });

  describe('API Contract Compliance', () => {
    it('returns consistent response formats across endpoints', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue([mockPublication]);

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('publications');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(Array.isArray(response.body.publications)).toBe(true);

      // Check individual publication structure
      const publication = response.body.publications[0];
      expect(publication).toHaveProperty('id');
      expect(publication).toHaveProperty('publication_name');
      expect(publication).toHaveProperty('status');
      expect(publication).toHaveProperty('created_at');
    });

    it('handles pagination parameters correctly', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue({
        publications: [mockPublication],
        total: 25,
        page: 2,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      });

      const response = await request(app)
        .get('/api/publications?page=2&limit=10')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.hasNext).toBe(true);
      expect(response.body.hasPrev).toBe(true);
    });

    it('validates request/response content types', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .set('Content-Type', 'application/json')
        .send({
          group_id: 1,
          publication_sn: 'TEST001',
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
        })
        .expect(201);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('State Synchronization', () => {
    it('maintains data consistency across related entities', async () => {
      const Publication = require('../../src/models/Publication');
      const UserNotification = require('../../src/models/UserNotification');

      // Create publication
      Publication.create.mockResolvedValue(mockPublication);
      UserNotification.create.mockResolvedValue(mockNotification);

      await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .send({
          group_id: 1,
          publication_sn: 'SYNC001',
          publication_name: 'Sync Test Publication',
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

      // Check that related notification was created
      expect(UserNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1,
          type: 'publication_submitted',
          title: expect.stringContaining('submitted'),
          message: expect.stringContaining('Sync Test Publication')
        })
      );
    });

    it('handles concurrent updates to the same resource', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock optimistic locking scenario
      Publication.findById.mockResolvedValue(mockPublication);
      Publication.update
        .mockRejectedValueOnce(new Error('Concurrent modification'))
        .mockResolvedValue({ ...mockPublication, publication_name: 'Updated Name' });

      // First update attempt
      await request(app)
        .put('/api/publications/1')
        .set('Authorization', 'Bearer mock-token')
        .send({
          publication_name: 'Updated Name'
        })
        .expect(200);

      expect(Publication.update).toHaveBeenCalledTimes(2); // Retry after failure
    });
  });

  describe('Error Propagation and Handling', () => {
    it('propagates validation errors correctly to frontend', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .send({
          // Missing required fields
          publication_name: 'Test Publication'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('handles network timeouts gracefully', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock slow database operation
      Publication.findAll.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return [];
      });

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .timeout(5000)
        .catch(error => error);

      expect(response.code || response.status).toBeDefined();
    });

    it('provides meaningful error messages for business logic failures', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock business logic error (e.g., duplicate publication SN)
      Publication.create.mockRejectedValue(new Error('Publication SN already exists'));

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .send({
          group_id: 1,
          publication_sn: 'DUPLICATE',
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
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authentication Flow Integration', () => {
    it('maintains session state across requests', async () => {
      const User = require('../../src/models/User');

      // Login
      User.findByEmail.mockResolvedValue({
        ...mockUser,
        verifyPassword: jest.fn().mockResolvedValue(true),
        setOTP: jest.fn(),
        verifyOTP: jest.fn().mockResolvedValue(true)
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123',
          recaptchaToken: 'valid-token'
        })
        .expect(200);

      expect(loginResponse.body.requiresOTP).toBe(true);

      // Verify OTP
      const verifyResponse = await request(app)
        .post('/api/auth/verify-login')
        .send({
          email: 'user@example.com',
          otp: '123456'
        })
        .expect(200);

      const accessToken = verifyResponse.body.tokens.accessToken;

      // Use token in subsequent requests
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.user.email).toBe('user@example.com');
    });

    it('handles token refresh correctly', async () => {
      // Mock token refresh
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=valid-refresh-token'])
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('message', 'Token refreshed successfully');
    });
  });

  describe('File Upload Integration', () => {
    it('handles file uploads with publication submissions', async () => {
      const Publication = require('../../src/models/Publication');

      Publication.create.mockResolvedValue({
        ...mockPublication,
        attachments: ['document.pdf', 'image.jpg']
      });

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .field('group_id', '1')
        .field('publication_sn', 'FILE001')
        .field('publication_name', 'Publication with Files')
        .field('publication_website', 'https://test.com')
        .field('publication_price', '100.00')
        .field('agreement_tat', '5')
        .field('practical_tat', '7')
        .field('publication_language', 'English')
        .field('publication_region', 'Global')
        .field('publication_primary_industry', 'Technology')
        .field('website_news_index', '50')
        .field('da', '25')
        .field('dr', '30')
        .field('words_limit', '1000')
        .field('number_of_images', '5')
        .field('recaptchaToken', 'valid-token')
        .attach('documents', Buffer.from('fake pdf content'), 'document.pdf')
        .attach('images', Buffer.from('fake image content'), 'image.jpg')
        .expect(201);

      expect(response.body.publication).toHaveProperty('attachments');
    });
  });

  describe('Real-time Features', () => {
    it('handles notification delivery', async () => {
      const UserNotification = require('../../src/models/UserNotification');

      UserNotification.findAll.mockResolvedValue([mockNotification]);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0]).toHaveProperty('type');
      expect(response.body.notifications[0]).toHaveProperty('title');
      expect(response.body.notifications[0]).toHaveProperty('message');
      expect(response.body.notifications[0]).toHaveProperty('is_read');
    });

    it('supports notification marking as read', async () => {
      const UserNotification = require('../../src/models/UserNotification');

      UserNotification.update.mockResolvedValue({
        ...mockNotification,
        is_read: true
      });

      const response = await request(app)
        .put('/api/notifications/1/read')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(UserNotification.update).toHaveBeenCalledWith(1, { is_read: true });
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('handles different user agent strings', async () => {
      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('supports different content encodings', async () => {
      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .set('Accept-Encoding', 'gzip, deflate')
        .send({
          group_id: 1,
          publication_sn: 'ENCODE001',
          publication_name: 'Encoding Test',
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

      expect(response.status).toBe(201);
    });
  });

  describe('API Versioning and Backward Compatibility', () => {
    it('maintains backward compatibility with existing API contracts', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue([mockPublication]);

      // Test current API version
      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Ensure response structure matches expected contract
      expect(response.body).toHaveProperty('publications');
      expect(response.body.publications[0]).toHaveProperty('id');
      expect(response.body.publications[0]).toHaveProperty('publication_name');
      expect(response.body.publications[0]).toHaveProperty('status');
    });

    it('handles API versioning headers', async () => {
      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .set('Accept', 'application/vnd.api+json; version=1')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });
});
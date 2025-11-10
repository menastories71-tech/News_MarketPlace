const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Publication');
jest.mock('../../src/models/User');
jest.mock('../../src/models/UserNotification');
jest.mock('../../src/services/emailService');

describe('Email Notification Flow Integration Tests', () => {
  let mockUser, mockAdmin, mockPublication;

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
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      is_active: true,
      adminId: 1,
      verifyPassword: jest.fn().mockResolvedValue(true),
      updateLastLogin: jest.fn(),
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        email: 'admin@example.com',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
        is_active: true
      })
    };

    // Mock publication data
    mockPublication = {
      id: 1,
      publication_name: 'Test Publication',
      publication_website: 'https://test.com',
      submitted_by: 1,
      status: 'pending',
      rejection_reason: null,
      admin_comments: null,
      approved_at: null,
      approved_by: null,
      rejected_at: null,
      rejected_by: null,
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        publication_name: 'Test Publication',
        publication_website: 'https://test.com',
        submitted_by: 1,
        status: 'pending',
        rejection_reason: null,
        admin_comments: null,
        approved_at: null,
        approved_by: null,
        rejected_at: null,
        rejected_by: null
      })
    };

    // Mock models
    const Publication = require('../../src/models/Publication');
    const User = require('../../src/models/User');
    const UserNotification = require('../../src/models/UserNotification');

    Publication.create = jest.fn();
    Publication.findById = jest.fn();
    Publication.update = jest.fn();

    User.findByEmail = jest.fn();
    User.findById = jest.fn();

    UserNotification.create = jest.fn();
  });

  describe('Publication Approval Email Notifications', () => {
    it('should send approval email notification when publication is approved', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const UserNotification = require('../../src/models/UserNotification');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved',
        approved_at: new Date(),
        approved_by: 1
      });
      UserNotification.create.mockResolvedValue({});
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ admin_comments: 'Approved for quality content' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Publication approved successfully');
      expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Your Publication Has Been Approved!',
        expect.stringContaining('Publication Approved!')
      );
      expect(UserNotification.create).toHaveBeenCalledWith({
        user_id: 1,
        type: 'publication_approved',
        title: 'Publication Approved!',
        message: expect.stringContaining('has been approved'),
        related_id: 1
      });
    });

    it('should handle email service failure gracefully', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const UserNotification = require('../../src/models/UserNotification');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved',
        approved_at: new Date(),
        approved_by: 1
      });
      UserNotification.create
        .mockResolvedValueOnce({}) // First call succeeds
        .mockResolvedValueOnce({}); // Second call for email failure notification
      emailService.sendCustomEmail = jest.fn().mockRejectedValue(new Error('Email service down'));

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ admin_comments: 'Approved' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Publication approved successfully');
      expect(emailService.sendCustomEmail).toHaveBeenCalled();
      expect(UserNotification.create).toHaveBeenCalledTimes(2); // Approval + email failure notifications
    });

    it('should not send email if user not found', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(null); // User not found
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved'
      });

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({})
        .expect(200);

      expect(emailService.sendCustomEmail).not.toHaveBeenCalled();
    });
  });

  describe('Publication Rejection Email Notifications', () => {
    it('should send rejection email notification when publication is rejected', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const UserNotification = require('../../src/models/UserNotification');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'rejected',
        rejected_at: new Date(),
        rejected_by: 1,
        rejection_reason: 'Content does not meet standards'
      });
      UserNotification.create.mockResolvedValue({});
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/1/reject')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          rejection_reason: 'Content does not meet standards',
          admin_comments: 'Please review guidelines'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Publication rejected successfully');
      expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Publication Submission Update',
        expect.stringContaining('Publication Review Update')
      );
      expect(UserNotification.create).toHaveBeenCalledWith({
        user_id: 1,
        type: 'publication_rejected',
        title: 'Publication Review Update',
        message: expect.stringContaining('Please check your email for details'),
        related_id: 1
      });
    });

    it('should require rejection reason', async () => {
      const response = await request(app)
        .post('/api/publications/1/reject')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ admin_comments: 'Rejected' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Rejection reason is required');
    });

    it('should handle rejection of already rejected publication', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockResolvedValue({
        ...mockPublication,
        status: 'rejected'
      });

      const response = await request(app)
        .post('/api/publications/1/reject')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ rejection_reason: 'Already rejected' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Publication is already rejected');
    });
  });

  describe('User Authentication Email Notifications', () => {
    it('should send OTP email during registration', async () => {
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({
        ...mockUser,
        setOTP: jest.fn(),
        toJSON: () => mockUser
      });
      emailService.sendOTP = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          first_name: 'New',
          last_name: 'User'
        })
        .expect(201);

      expect(emailService.sendOTP).toHaveBeenCalled();
    });

    it('should send forgot password email', async () => {
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      User.findByEmail.mockResolvedValue(mockUser);
      emailService.sendPasswordResetEmail = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com', expect.any(String));
    });

    it('should handle email service failure in forgot password', async () => {
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      User.findByEmail.mockResolvedValue(mockUser);
      emailService.sendPasswordResetEmail = jest.fn().mockRejectedValue(new Error('Email service failed'));

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('Email Template Generation', () => {
    it('should generate proper approval email template', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      const approvedPublication = {
        ...mockPublication,
        status: 'approved',
        approved_at: new Date(),
        approved_by: 1,
        admin_comments: 'Great content!'
      };

      Publication.findById.mockResolvedValue(approvedPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue(approvedPublication);
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ admin_comments: 'Great content!' });

      expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Your Publication Has Been Approved!',
        expect.stringContaining('🎉 Publication Approved!')
      );
    });

    it('should generate proper rejection email template', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      const rejectedPublication = {
        ...mockPublication,
        status: 'rejected',
        rejected_at: new Date(),
        rejected_by: 1,
        rejection_reason: 'Quality issues',
        admin_comments: 'Please improve content quality'
      };

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue(rejectedPublication);
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      await request(app)
        .post('/api/publications/1/reject')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          rejection_reason: 'Quality issues',
          admin_comments: 'Please improve content quality'
        });

      expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Publication Submission Update',
        expect.stringContaining('Publication Review Update')
      );
    });
  });

  describe('Notification System Integration', () => {
    it('should create in-app notifications for approval', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const UserNotification = require('../../src/models/UserNotification');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved'
      });
      UserNotification.create.mockResolvedValue({});
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({});

      expect(UserNotification.create).toHaveBeenCalledWith({
        user_id: 1,
        type: 'publication_approved',
        title: 'Publication Approved!',
        message: expect.stringContaining('has been approved'),
        related_id: 1
      });
    });

    it('should create in-app notifications for rejection', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const UserNotification = require('../../src/models/UserNotification');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'rejected',
        rejection_reason: 'Test rejection'
      });
      UserNotification.create.mockResolvedValue({});
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      await request(app)
        .post('/api/publications/1/reject')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ rejection_reason: 'Test rejection' });

      expect(UserNotification.create).toHaveBeenCalledWith({
        user_id: 1,
        type: 'publication_rejected',
        title: 'Publication Review Update',
        message: expect.stringContaining('Please check your email for details'),
        related_id: 1
      });
    });

    it('should handle notification creation failure gracefully', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const UserNotification = require('../../src/models/UserNotification');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved'
      });
      UserNotification.create.mockRejectedValue(new Error('Notification failed'));
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({})
        .expect(200);

      // Should still succeed even if notification fails
      expect(response.body).toHaveProperty('message', 'Publication approved successfully');
    });
  });

  describe('Email Notification Edge Cases', () => {
    it('should handle concurrent approval requests', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved'
      });
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      const approvalPromises = Array(3).fill().map(() =>
        request(app)
          .post('/api/publications/1/approve')
          .set('Authorization', 'Bearer mock-admin-token')
          .send({})
      );

      const responses = await Promise.all(approvalPromises);

      // At least one should succeed, others might fail due to status conflict
      const successCount = responses.filter(r => r.status === 200).length;
      const conflictCount = responses.filter(r => r.status === 400).length;

      expect(successCount + conflictCount).toBe(3);
    });

    it('should handle malformed email addresses gracefully', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      const userWithBadEmail = { ...mockUser, email: 'invalid-email-address' };
      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(userWithBadEmail);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved'
      });
      emailService.sendCustomEmail = jest.fn().mockRejectedValue(new Error('Invalid email format'));

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({})
        .expect(200);

      // Should still succeed, email failure is logged but doesn't fail the operation
      expect(response.body).toHaveProperty('message', 'Publication approved successfully');
    });

    it('should handle very long admin comments', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      const longComment = 'x'.repeat(10000); // Very long comment
      Publication.findById.mockResolvedValue(mockPublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...mockPublication,
        status: 'approved',
        admin_comments: longComment
      });
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ admin_comments: longComment })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Publication approved successfully');
      expect(emailService.sendCustomEmail).toHaveBeenCalled();
    });

    it('should handle special characters in publication names', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');
      const emailService = require('../../src/services/emailService');

      const specialNamePublication = {
        ...mockPublication,
        publication_name: 'Test & Publication "Special" <Chars> ©™'
      };

      Publication.findById.mockResolvedValue(specialNamePublication);
      User.findById.mockResolvedValue(mockUser);
      Publication.update.mockResolvedValue({
        ...specialNamePublication,
        status: 'approved'
      });
      emailService.sendCustomEmail = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/publications/1/approve')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({})
        .expect(200);

      expect(emailService.sendCustomEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Your Publication Has Been Approved!',
        expect.stringContaining('Test & Publication "Special" <Chars> ©™')
      );
    });
  });
});
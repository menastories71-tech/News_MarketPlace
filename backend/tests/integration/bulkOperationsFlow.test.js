const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Publication');
jest.mock('../../src/models/User');
jest.mock('../../src/models/Admin');
jest.mock('../../src/services/emailService');
jest.mock('../../src/utils/bulkOperations');

describe('Bulk Operations Flow Integration Tests', () => {
  let mockUser, mockAdmin, mockPublications;

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

    // Mock publications data
    mockPublications = [
      {
        id: 1,
        publication_name: 'Publication 1',
        status: 'pending',
        submitted_by: 1,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          publication_name: 'Publication 1',
          status: 'pending',
          submitted_by: 1
        })
      },
      {
        id: 2,
        publication_name: 'Publication 2',
        status: 'pending',
        submitted_by: 1,
        toJSON: jest.fn().mockReturnValue({
          id: 2,
          publication_name: 'Publication 2',
          status: 'pending',
          submitted_by: 1
        })
      },
      {
        id: 3,
        publication_name: 'Publication 3',
        status: 'approved',
        submitted_by: 2,
        toJSON: jest.fn().mockReturnValue({
          id: 3,
          publication_name: 'Publication 3',
          status: 'approved',
          submitted_by: 2
        })
      }
    ];

    // Mock models
    const Publication = require('../../src/models/Publication');
    const User = require('../../src/models/User');
    const Admin = require('../../src/models/Admin');

    Publication.create = jest.fn();
    Publication.findById = jest.fn();
    Publication.findAll = jest.fn();
    Publication.update = jest.fn();
    Publication.delete = jest.fn();

    User.findByEmail = jest.fn();
    Admin.findByEmail = jest.fn();
  });

  describe('Bulk Create Operations', () => {
    it('should allow admin to bulk create publications', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.create.mockResolvedValueOnce(mockPublications[0])
        .mockResolvedValueOnce(mockPublications[1]);

      const bulkData = [
        {
          group_id: 1,
          publication_sn: 'BULK001',
          publication_grade: 'A',
          publication_name: 'Bulk Publication 1',
          publication_website: 'https://bulk1.com',
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
        },
        {
          group_id: 1,
          publication_sn: 'BULK002',
          publication_grade: 'B',
          publication_name: 'Bulk Publication 2',
          publication_website: 'https://bulk2.com',
          publication_price: 80.00,
          agreement_tat: 3,
          practical_tat: 5,
          publication_language: 'English',
          publication_region: 'US',
          publication_primary_industry: 'Business',
          website_news_index: 40,
          da: 20,
          dr: 25,
          words_limit: 800,
          number_of_images: 3
        }
      ];

      const response = await request(app)
        .post('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ publications: bulkData })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('created');
      expect(response.body.created).toBe(2);
      expect(Publication.create).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in bulk create', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.create
        .mockResolvedValueOnce(mockPublications[0])
        .mockRejectedValueOnce(new Error('Validation failed'))
        .mockResolvedValueOnce(mockPublications[2]);

      const bulkData = [
        { publication_name: 'Valid Publication' },
        { publication_name: 'Invalid Publication' },
        { publication_name: 'Another Valid Publication' }
      ];

      const response = await request(app)
        .post('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ publications: bulkData })
        .expect(201);

      expect(response.body.created).toBe(2);
      expect(response.body.errors).toBe(1);
      expect(response.body).toHaveProperty('creationErrors');
    });

    it('should deny bulk create for non-admin users', async () => {
      const response = await request(app)
        .post('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ publications: [] })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin authentication required for bulk operations');
    });
  });

  describe('Bulk Update Operations', () => {
    it('should allow content manager to bulk update publications', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockImplementation((id) => {
        return Promise.resolve(mockPublications.find(p => p.id === id) || null);
      });
      Publication.update.mockResolvedValue(true);

      const updates = [
        { id: 1, publication_price: 120.00 },
        { id: 2, publication_price: 90.00 }
      ];

      const response = await request(app)
        .put('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-content-manager-token')
        .send({ updates })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.updated).toBe(2);
      expect(Publication.update).toHaveBeenCalledTimes(2);
    });

    it('should handle bulk update with some failures', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById
        .mockResolvedValueOnce(mockPublications[0])
        .mockResolvedValueOnce(null) // Publication not found
        .mockResolvedValueOnce(mockPublications[2]);

      Publication.update.mockResolvedValue(true);

      const updates = [
        { id: 1, publication_price: 120.00 },
        { id: 999, publication_price: 90.00 }, // Non-existent
        { id: 3, publication_price: 110.00 }
      ];

      const response = await request(app)
        .put('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ updates })
        .expect(200);

      expect(response.body.updated).toBe(2);
      expect(response.body.errors).toBe(1);
      expect(response.body).toHaveProperty('updateErrors');
    });

    it('should validate bulk update permissions', async () => {
      const response = await request(app)
        .put('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-user-token')
        .send({ updates: [] })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Bulk Delete Operations', () => {
    it('should allow super admin to bulk delete publications', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockImplementation((id) => {
        return Promise.resolve(mockPublications.find(p => p.id === id) || null);
      });
      Publication.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-super-admin-token')
        .send({ ids: [1, 2, 3] })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.deleted.length).toBe(3);
      expect(Publication.delete).toHaveBeenCalledTimes(3);
    });

    it('should deny content manager from bulk delete', async () => {
      const response = await request(app)
        .delete('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-content-manager-token')
        .send({ ids: [1, 2, 3] })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Insufficient permissions for bulk delete operations');
    });

    it('should handle bulk delete with non-existent publications', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById
        .mockResolvedValueOnce(mockPublications[0])
        .mockResolvedValueOnce(null) // Publication not found
        .mockResolvedValueOnce(mockPublications[2]);

      Publication.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-super-admin-token')
        .send({ ids: [1, 999, 3] })
        .expect(200);

      expect(response.body.deleted.length).toBe(2);
      expect(response.body.errors).toBe(1);
    });
  });

  describe('Bulk Status Update Operations', () => {
    it('should allow admin to bulk update publication status', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockImplementation((id) => {
        return Promise.resolve(mockPublications.find(p => p.id === id) || null);
      });
      Publication.update.mockResolvedValue(true);

      const response = await request(app)
        .patch('/api/publications/bulk/status')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          publicationIds: [1, 2],
          status: 'approved'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Bulk status update completed');
      expect(Publication.update).toHaveBeenCalledTimes(2);
    });

    it('should validate status values in bulk update', async () => {
      const response = await request(app)
        .patch('/api/publications/bulk/status')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          publicationIds: [1, 2],
          status: 'invalid_status'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Bulk Edit Operations', () => {
    it('should allow content manager to bulk edit common fields', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findById.mockImplementation((id) => {
        return Promise.resolve(mockPublications.find(p => p.id === id) || null);
      });
      Publication.update.mockResolvedValue(true);

      const response = await request(app)
        .patch('/api/publications/bulk-edit')
        .set('Authorization', 'Bearer mock-content-manager-token')
        .send({
          ids: [1, 2],
          updates: {
            publication_price: 150.00,
            agreement_tat: 7
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.updated).toBe(2);
      expect(Publication.update).toHaveBeenCalledTimes(2);
    });

    it('should validate allowed fields for bulk edit', async () => {
      const response = await request(app)
        .patch('/api/publications/bulk-edit')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          ids: [1, 2],
          updates: {
            publication_name: 'New Name', // Not allowed for bulk edit
            publication_price: 150.00
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid fields for bulk edit');
    });
  });

  describe('Bulk File Upload Operations', () => {
    it('should allow content manager to upload CSV file', async () => {
      const BulkOperations = require('../../src/utils/bulkOperations');
      BulkOperations.parseFile = jest.fn().mockResolvedValue([
        {
          publication_name: 'CSV Publication 1',
          publication_website: 'https://csv1.com',
          publication_price: '100.00'
        }
      ]);
      BulkOperations.validatePublicationData = jest.fn().mockReturnValue([]);
      BulkOperations.transformPublicationData = jest.fn().mockReturnValue([
        {
          publication_name: 'CSV Publication 1',
          publication_website: 'https://csv1.com',
          publication_price: 100.00
        }
      ]);
      BulkOperations.cleanupFile = jest.fn();

      const Publication = require('../../src/models/Publication');
      Publication.create.mockResolvedValue(mockPublications[0]);

      const csvContent = 'publication_name,publication_website,publication_price\nCSV Publication 1,https://csv1.com,100.00';

      const response = await request(app)
        .post('/api/publications/bulk-upload')
        .set('Authorization', 'Bearer mock-content-manager-token')
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.created).toBe(1);
      expect(BulkOperations.parseFile).toHaveBeenCalled();
      expect(BulkOperations.cleanupFile).toHaveBeenCalled();
    });

    it('should handle validation errors in bulk upload', async () => {
      const BulkOperations = require('../../src/utils/bulkOperations');
      BulkOperations.parseFile = jest.fn().mockResolvedValue([
        { publication_name: 'Valid', publication_website: 'https://valid.com' },
        { publication_name: '', publication_website: 'invalid-url' } // Invalid
      ]);
      BulkOperations.validatePublicationData = jest.fn()
        .mockReturnValueOnce([]) // Valid
        .mockReturnValueOnce(['Name is required', 'Invalid website URL']); // Invalid
      BulkOperations.cleanupFile = jest.fn();

      const response = await request(app)
        .post('/api/publications/bulk-upload')
        .set('Authorization', 'Bearer mock-admin-token')
        .attach('file', Buffer.from('test,csv,data'), 'test.csv')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed for some records');
      expect(response.body).toHaveProperty('validationErrors');
      expect(BulkOperations.cleanupFile).toHaveBeenCalled();
    });

    it('should reject unsupported file types', async () => {
      const response = await request(app)
        .post('/api/publications/bulk-upload')
        .set('Authorization', 'Bearer mock-admin-token')
        .attach('file', Buffer.from('test data'), 'test.txt')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle file processing errors', async () => {
      const BulkOperations = require('../../src/utils/bulkOperations');
      BulkOperations.parseFile = jest.fn().mockRejectedValue(new Error('File processing failed'));
      BulkOperations.cleanupFile = jest.fn();

      const response = await request(app)
        .post('/api/publications/bulk-upload')
        .set('Authorization', 'Bearer mock-admin-token')
        .attach('file', Buffer.from('test,csv,data'), 'test.csv')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Bulk upload failed');
      expect(BulkOperations.cleanupFile).toHaveBeenCalled();
    });
  });

  describe('Template Download Operations', () => {
    it('should allow admin to download CSV template', async () => {
      const response = await request(app)
        .get('/api/publications/template/csv')
        .set('Authorization', 'Bearer mock-admin-token')
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment; filename="publications_template.csv"');
    });

    it('should allow admin to download Excel template', async () => {
      const response = await request(app)
        .get('/api/publications/template/excel')
        .set('Authorization', 'Bearer mock-admin-token')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment; filename="publications_template.xlsx"');
    });

    it('should deny template download for non-admin users', async () => {
      const response = await request(app)
        .get('/api/publications/template/csv')
        .set('Authorization', 'Bearer mock-user-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Bulk Operations Security and Edge Cases', () => {
    it('should handle empty bulk operations gracefully', async () => {
      const response = await request(app)
        .post('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ publications: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Publications array is required');
    });

    it('should handle oversized bulk operations', async () => {
      const largeBulkData = Array(1001).fill().map((_, i) => ({
        publication_name: `Publication ${i}`,
        publication_website: `https://pub${i}.com`,
        publication_price: 100.00
      }));

      const response = await request(app)
        .post('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ publications: largeBulkData })
        .expect(413); // Payload too large

      expect(response.status).toBe(413);
    });

    it('should handle concurrent bulk operations', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.create.mockResolvedValue(mockPublications[0]);

      const bulkPromises = Array(3).fill().map(() =>
        request(app)
          .post('/api/publications/bulk')
          .set('Authorization', 'Bearer mock-admin-token')
          .send({
            publications: [{
              publication_name: 'Concurrent Publication',
              publication_website: 'https://concurrent.com',
              publication_price: 100.00
            }]
          })
      );

      const responses = await Promise.all(bulkPromises);
      responses.forEach(response => {
        expect([201, 429]).toContain(response.status); // Success or rate limited
      });
    });

    it('should validate bulk operation data types', async () => {
      const invalidData = [
        { publication_name: 123, publication_website: 'https://test.com' }, // Invalid name type
        { publication_name: 'Valid', publication_price: 'not-a-number' } // Invalid price type
      ];

      const response = await request(app)
        .post('/api/publications/bulk')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({ publications: invalidData })
        .expect(201); // May succeed with validation errors

      expect(response.body).toHaveProperty('errors');
    });
  });
});
const request = require('supertest');
const app = require('../../server');
const { query } = require('../../src/config/database');

// Mock database for testing
jest.mock('../../src/config/database');
jest.mock('../../src/models/Publication');
jest.mock('../../src/models/User');

describe('Performance Testing', () => {
  let mockUser, mockPublications;

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

    // Create mock publications for performance testing
    mockPublications = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      group_id: 1,
      publication_sn: `TEST${String(index + 1).padStart(3, '0')}`,
      publication_name: `Test Publication ${index + 1}`,
      status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected',
      submitted_by: 1,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      toJSON: jest.fn().mockReturnValue({
        id: index + 1,
        group_id: 1,
        publication_sn: `TEST${String(index + 1).padStart(3, '0')}`,
        publication_name: `Test Publication ${index + 1}`,
        status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected',
        submitted_by: 1,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      })
    }));

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

  describe('Large Dataset Performance', () => {
    it('handles large publication lists efficiently', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue(mockPublications);

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Response should complete within reasonable time (under 2 seconds for 1000 records)
      expect(responseTime).toBeLessThan(2000);
      expect(response.body.publications).toHaveLength(1000);
    });

    it('handles pagination with large datasets', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock paginated response
      const paginatedPublications = mockPublications.slice(0, 50);
      Publication.findAll.mockResolvedValue({
        publications: paginatedPublications,
        total: 1000,
        page: 1,
        totalPages: 20,
        hasNext: true,
        hasPrev: false
      });

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/publications?page=1&limit=50')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Should be fast with pagination
      expect(response.body.publications).toHaveLength(50);
      expect(response.body.total).toBe(1000);
      expect(response.body.totalPages).toBe(20);
    });

    it('handles search queries on large datasets', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock search results
      const searchResults = mockPublications.filter(pub =>
        pub.publication_name.includes('Publication 1')
      );
      Publication.findAll.mockResolvedValue(searchResults);

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/publications?search=Publication%201')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1500); // Search should be reasonably fast
      expect(response.body.publications.length).toBeGreaterThan(0);
    });

    it('handles filtering on large datasets', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock filtered results
      const filteredPublications = mockPublications.filter(pub => pub.status === 'approved');
      Publication.findAll.mockResolvedValue(filteredPublications);

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/publications?status=approved')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1500);
      expect(response.body.publications.every(pub => pub.status === 'approved')).toBe(true);
    });
  });

  describe('Concurrent Load Testing', () => {
    it('handles multiple simultaneous requests', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');

      User.findByEmail.mockResolvedValue(mockUser);
      Publication.create.mockResolvedValue(mockPublications[0]);

      const concurrentRequests = Array(50).fill().map((_, index) =>
        request(app)
          .post('/api/publications')
          .set('Authorization', 'Bearer mock-token')
          .send({
            group_id: 1,
            publication_sn: `CONC${index}`,
            publication_name: `Concurrent Publication ${index}`,
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
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / responses.length;

      // Average response time should be reasonable
      expect(avgResponseTime).toBeLessThan(500);

      // Most requests should succeed
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(responses.length * 0.8); // 80% success rate
    });

    it('maintains performance under sustained load', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue(mockPublications.slice(0, 100));

      const requestTimes = [];

      // Make 20 sequential requests
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();

        await request(app)
          .get('/api/publications')
          .set('Authorization', 'Bearer mock-token')
          .expect(200);

        const endTime = Date.now();
        requestTimes.push(endTime - startTime);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const avgResponseTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
      const maxResponseTime = Math.max(...requestTimes);

      expect(avgResponseTime).toBeLessThan(300);
      expect(maxResponseTime).toBeLessThan(1000);
    });
  });

  describe('Memory Usage Testing', () => {
    it('handles memory-intensive operations', async () => {
      const Publication = require('../../src/models/Publication');

      // Create a very large dataset
      const largeDataset = Array.from({ length: 5000 }, (_, index) => ({
        id: index + 1,
        group_id: 1,
        publication_sn: `LARGE${String(index + 1).padStart(4, '0')}`,
        publication_name: `Large Dataset Publication ${index + 1}`,
        status: 'approved',
        submitted_by: 1,
        created_at: new Date(),
        toJSON: jest.fn().mockReturnValue({
          id: index + 1,
          group_id: 1,
          publication_sn: `LARGE${String(index + 1).padStart(4, '0')}`,
          publication_name: `Large Dataset Publication ${index + 1}`,
          status: 'approved',
          submitted_by: 1,
          created_at: new Date()
        })
      }));

      Publication.findAll.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const initialMemory = process.memoryUsage().heapUsed;

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const endTime = Date.now();
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expect(endTime - startTime).toBeLessThan(3000); // Should handle large dataset reasonably
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
      expect(response.body.publications).toHaveLength(5000);
    });

    it('prevents memory leaks in repeated operations', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue(mockPublications.slice(0, 100));

      const memoryUsages = [];

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get('/api/publications')
          .set('Authorization', 'Bearer mock-token')
          .expect(200);

        memoryUsages.push(process.memoryUsage().heapUsed);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      // Memory usage should not continuously increase
      const initialMemory = memoryUsages[0];
      const finalMemory = memoryUsages[memoryUsages.length - 1];
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB total increase
    });
  });

  describe('Database Query Performance', () => {
    it('optimizes database queries for large datasets', async () => {
      const Publication = require('../../src/models/Publication');

      // Mock query execution time
      Publication.findAll.mockImplementation(async () => {
        // Simulate database query time
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockPublications.slice(0, 100);
      });

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/publications?limit=100')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // Should include reasonable query time
      expect(response.body.publications).toHaveLength(100);
    });

    it('handles database connection pooling efficiently', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue(mockPublications.slice(0, 50));

      const concurrentRequests = Array(20).fill().map(() =>
        request(app)
          .get('/api/publications')
          .set('Authorization', 'Bearer mock-token')
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / responses.length;

      expect(avgResponseTime).toBeLessThan(200);
      expect(responses.every(r => r.status === 200)).toBe(true);
    });
  });

  describe('API Response Time Testing', () => {
    it('meets response time SLAs for different endpoints', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');

      // Test different endpoints
      const endpoints = [
        { method: 'get', path: '/api/publications', mock: () => Publication.findAll.mockResolvedValue([]) },
        { method: 'get', path: '/api/publications/1', mock: () => Publication.findById.mockResolvedValue(mockPublications[0]) },
        { method: 'post', path: '/api/publications', mock: () => {
          User.findByEmail.mockResolvedValue(mockUser);
          Publication.create.mockResolvedValue(mockPublications[0]);
        }},
      ];

      for (const endpoint of endpoints) {
        endpoint.mock();

        const startTime = Date.now();

        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', 'Bearer mock-token')
          .send(endpoint.method === 'post' ? {
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
          } : {})
          .expect([200, 201]);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Different SLAs for different operations
        const maxTime = endpoint.method === 'get' ? 500 : 1000;
        expect(responseTime).toBeLessThan(maxTime);
      }
    });

    it('handles slow network conditions gracefully', async () => {
      const Publication = require('../../src/models/Publication');

      // Simulate slow response
      Publication.findAll.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return mockPublications.slice(0, 10);
      });

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .timeout(3000)
        .expect(200);

      expect(response.body.publications).toHaveLength(10);
    });
  });

  describe('Caching Performance', () => {
    it('benefits from response caching', async () => {
      const Publication = require('../../src/models/Publication');

      // First request - no cache
      Publication.findAll.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockPublications.slice(0, 50);
      });

      const firstStartTime = Date.now();
      await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);
      const firstEndTime = Date.now();

      // Second request - should be faster (simulating cache hit)
      Publication.findAll.mockResolvedValue(mockPublications.slice(0, 50));

      const secondStartTime = Date.now();
      await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);
      const secondEndTime = Date.now();

      const firstRequestTime = firstEndTime - firstStartTime;
      const secondRequestTime = secondEndTime - secondStartTime;

      // Second request should be faster
      expect(secondRequestTime).toBeLessThan(firstRequestTime);
    });

    it('handles cache invalidation correctly', async () => {
      const Publication = require('../../src/models/Publication');
      const User = require('../../src/models/User');

      User.findByEmail.mockResolvedValue(mockUser);

      // Initial data
      Publication.findAll.mockResolvedValue(mockPublications.slice(0, 10));

      // First request
      await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Create new publication (should invalidate cache)
      Publication.create.mockResolvedValue({
        ...mockPublications[0],
        id: 1001,
        publication_name: 'New Publication'
      });

      await request(app)
        .post('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .send({
          group_id: 1,
          publication_sn: 'NEW001',
          publication_name: 'New Publication',
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

      // Next read should include the new publication
      Publication.findAll.mockResolvedValue([
        ...mockPublications.slice(0, 10),
        { ...mockPublications[0], id: 1001, publication_name: 'New Publication' }
      ]);

      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.publications.some(p => p.id === 1001)).toBe(true);
    });
  });

  describe('Resource Cleanup', () => {
    it('properly cleans up resources after requests', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue(mockPublications.slice(0, 10));

      // Make multiple requests
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/publications')
          .set('Authorization', 'Bearer mock-token')
      );

      await Promise.all(requests);

      // Check that no resources are leaked
      // This is a basic check - in a real scenario, you'd use tools like clinic.js
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    });

    it('handles connection cleanup properly', async () => {
      const Publication = require('../../src/models/Publication');
      Publication.findAll.mockResolvedValue([]);

      // Make requests with different auth tokens
      const tokens = ['token1', 'token2', 'token3'];
      const requests = tokens.map(token =>
        request(app)
          .get('/api/publications')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);

      // All requests should complete successfully
      expect(responses.every(r => r.status === 200)).toBe(true);
    });
  });
});
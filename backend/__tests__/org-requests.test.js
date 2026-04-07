/**
 * Org Requests Controller Tests
 */

const { createMockReq, createMockRes, createMockNext, pool } = require('./setup');
const orgRequestController = require('../controllers/orgRequestController');

jest.mock('../config/db');

describe('Org Requests Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = createMockNext();
  });

  describe('POST /api/org-requests', () => {
    it('should submit organization request with valid data', async () => {
      mockReq.body = {
        first_name: 'Ahmed',
        last_name: 'Ben Ali',
        email: 'ahmed@example.com',
        phone: '+216 99 123 456',
        description: 'Tourism company',
        document_name: 'License',
        document_data: 'base64data',
      };

      pool.query
        .mockResolvedValueOnce([[], []]) // Check pending request
        .mockResolvedValueOnce([{ insertId: 1 }, []]) // Insert request
        .mockResolvedValueOnce([[], []]) // Update user role
        .mockResolvedValueOnce([[{ id: 1, status: 'pending' }], []]);

      await orgRequestController.submit(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return error if first_name is missing', async () => {
      mockReq.body = {
        last_name: 'Ben Ali',
        email: 'ahmed@example.com',
        phone: '+216 99 123 456',
        description: 'Tourism company',
      };

      await orgRequestController.submit(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('first_name') })
      );
    });

    it('should return error for invalid email format', async () => {
      mockReq.body = {
        first_name: 'Ahmed',
        last_name: 'Ben Ali',
        email: 'invalid-email',
        phone: '+216 99 123 456',
        description: 'Tourism company',
      };

      await orgRequestController.submit(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('email') })
      );
    });

    it('should return error if pending request exists', async () => {
      mockReq.body = {
        first_name: 'Ahmed',
        last_name: 'Ben Ali',
        email: 'ahmed@example.com',
        phone: '+216 99 123 456',
        description: 'Tourism company',
      };

      pool.query.mockResolvedValueOnce([[{ id: 1 }], []]); // Existing pending request

      await orgRequestController.submit(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('en attente') })
      );
    });
  });

  describe('GET /api/org-requests/mine', () => {
    it('should return user latest org request', async () => {
      const mockRequest = { id: 1, user_id: 3, status: 'pending' };
      pool.query.mockResolvedValueOnce([[mockRequest], []]);

      await orgRequestController.getMine(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRequest,
      });
    });

    it('should return null if no request found', async () => {
      pool.query.mockResolvedValueOnce([[], []]);

      await orgRequestController.getMine(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });
  });

  describe('GET /api/org-requests (admin)', () => {
    it('should return all org requests', async () => {
      const mockRequests = [
        { id: 1, user_id: 3, status: 'pending' },
        { id: 2, user_id: 4, status: 'approved' },
      ];

      pool.query.mockResolvedValueOnce([mockRequests, []]);

      await orgRequestController.getAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockRequests);
    });
  });

  describe('PATCH /api/org-requests/:id/approve (admin)', () => {
    it('should approve organization request', async () => {
      mockReq.params.id = 1;

      pool.query
        .mockResolvedValueOnce([[{ id: 1, user_id: 3, status: 'pending' }], []])
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockResolvedValueOnce([[], []]);

      await orgRequestController.approve(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should return error if request not found', async () => {
      mockReq.params.id = 999;
      pool.query.mockResolvedValueOnce([[], []]);

      await orgRequestController.approve(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('PATCH /api/org-requests/:id/reject (admin)', () => {
    it('should reject organization request', async () => {
      mockReq.params.id = 1;
      mockReq.body = { reason: 'Incomplete documents' };

      pool.query
        .mockResolvedValueOnce([[{ id: 1, user_id: 3 }], []])
        .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      await orgRequestController.reject(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });
});

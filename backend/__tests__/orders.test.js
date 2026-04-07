/**
 * Order Controller Tests
 */

const { createMockReq, createMockRes, createMockNext, getTestData, pool } = require('./setup');
const orderController = require('../controllers/orderController');

jest.mock('../config/db');
jest.mock('uuid', () => ({ v4: () => '550e8400-4567-89ab-cdef-0123456789ab' }));

describe('Order Controller', () => {
  let mockReq, mockRes, mockNext, testData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = createMockNext();
    testData = getTestData();
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const mockOrders = [
        { id: 1, ref_code: 'TT-ABC123', user_id: 3, total: 378, status: 'confirmed' },
      ];

      pool.query.mockResolvedValueOnce([mockOrders, []]);

      await orderController.getMine(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should return empty array if no orders', async () => {
      pool.query.mockResolvedValueOnce([[], []]);

      await orderController.getMine(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return specific order for user', async () => {
      mockReq.params.id = 1;
      const mockOrder = { id: 1, ref_code: 'TT-ABC123', user_id: 3, total: 378 };
      pool.query.mockResolvedValueOnce([[mockOrder], []]);

      await orderController.getById(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 404 if order not found', async () => {
      mockReq.params.id = 999;
      pool.query.mockResolvedValueOnce([[], []]);

      await orderController.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Commande introuvable' });
    });
  });

  describe('POST /api/orders', () => {
    it('should create order with UUID refCode', async () => {
      mockReq.body = testData.validOrder;
      
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }, []])
        .mockResolvedValueOnce([{ insertId: 1 }, []])
        .mockResolvedValueOnce([[{ id: 1, ref_code: 'TT-550E8400', total: 378 }], []]);

      await orderController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return error if items is missing', async () => {
      mockReq.body = { total: 378 };

      await orderController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Items requis' });
    });

    it('should return error if total is invalid', async () => {
      mockReq.body = { items: [], total: -100 };

      await orderController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return error if total is missing', async () => {
      mockReq.body = { items: [] };

      await orderController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should clear cart after order', async () => {
      mockReq.body = testData.validOrder;
      
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }, []])
        .mockResolvedValueOnce([{ affectedRows: 2 }, []]) // DELETE from cart
        .mockResolvedValueOnce([[{ id: 1 }], []]);

      await orderController.create(mockReq, mockRes, mockNext);

      // Verify cart was cleared (second query call)
      const calls = pool.query.mock.calls;
      expect(calls[1][0]).toContain('DELETE FROM cart_items');
    });
  });
});

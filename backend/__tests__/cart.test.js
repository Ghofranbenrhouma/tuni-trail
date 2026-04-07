/**
 * Cart Controller Tests
 */

const { createMockReq, createMockRes, createMockNext, getTestData, pool } = require('./setup');
const cartController = require('../controllers/cartController');

jest.mock('../config/db');

describe('Cart Controller', () => {
  let mockReq, mockRes, mockNext, testData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = createMockNext();
    testData = getTestData();
  });

  describe('GET /api/cart', () => {
    it('should return cart items with success format', async () => {
      const mockCartItems = [
        {
          id: 1,
          product_id: 'p1',
          quantity: 2,
          name: 'Tente Dôme 2 personnes',
          price: '189 DT',
          price_num: 189,
        },
      ];

      pool.query.mockResolvedValueOnce([mockCartItems, []]);

      await cartController.get(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCartItems,
      });
    });

    it('should return empty cart if no items', async () => {
      pool.query.mockResolvedValueOnce([[], []]);

      await cartController.get(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should call next on database error', async () => {
      const error = new Error('DB Error');
      pool.query.mockRejectedValueOnce(error);

      await cartController.get(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      mockReq.body = { product_id: 'p1' };
      pool.query.mockResolvedValueOnce([{ insertId: 1 }, []]);

      await cartController.add(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return error if product_id is missing', async () => {
      mockReq.body = {};

      await cartController.add(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'product_id requis' });
    });
  });

  describe('PUT /api/cart/:id', () => {
    it('should update quantity if valid', async () => {
      mockReq.params.id = 1;
      mockReq.body = { quantity: 5 };
      pool.query.mockResolvedValueOnce([[], []]);

      await cartController.updateQty(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should delete item if quantity is 0', async () => {
      mockReq.params.id = 1;
      mockReq.body = { quantity: 0 };
      pool.query.mockResolvedValueOnce([[], []]);

      await cartController.updateQty(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return error for invalid quantity', async () => {
      mockReq.params.id = 1;
      mockReq.body = { quantity: -1 };

      await cartController.updateQty(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return error if quantity is missing', async () => {
      mockReq.params.id = 1;
      mockReq.body = {};

      await cartController.updateQty(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('DELETE /api/cart/:id', () => {
    it('should remove item from cart', async () => {
      mockReq.params.id = 1;
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      await cartController.remove(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear entire cart', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 3 }, []]);

      await cartController.clear(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });
});

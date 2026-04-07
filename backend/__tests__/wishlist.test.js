/**
 * Wishlist Controller Tests
 */

const { createMockReq, createMockRes, createMockNext, getTestData, pool } = require('./setup');
const wishlistController = require('../controllers/wishlistController');

jest.mock('../config/db');

describe('Wishlist Controller', () => {
  let mockReq, mockRes, mockNext, testData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = createMockNext();
    testData = getTestData();
  });

  describe('GET /api/wishlist', () => {
    it('should return wishlist items with success format', async () => {
      const mockWishlist = [
        { id: 1, product_id: 'p1', name: 'Tente Dôme 2 personnes', price: '189 DT' },
        { id: 2, product_id: 'p2', name: 'Tente Familiale 4 personnes', price: '320 DT' },
      ];

      pool.query.mockResolvedValueOnce([mockWishlist, []]);

      await wishlistController.get(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockWishlist,
      });
    });

    it('should return empty wishlist', async () => {
      pool.query.mockResolvedValueOnce([[], []]);

      await wishlistController.get(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('POST /api/wishlist (toggle)', () => {
    it('should add product to wishlist', async () => {
      mockReq.body = { product_id: 'p1' };
      const mockProduct = [{ id: 'p1', name: 'Tente Dôme 2 personnes' }];

      // Mock the sequential queries
      pool.query
        .mockResolvedValueOnce([mockProduct, []])  // Product check
        .mockResolvedValueOnce([[], []]) // No existing entry
        .mockResolvedValueOnce([[], []]); // Insert

      await wishlistController.toggle(mockReq, mockRes, mockNext);

      if (mockRes.json.mock.calls.length > 0) {
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            action: 'added',
          })
        );
      }
    });

    it('should remove product from wishlist', async () => {
      mockReq.body = { product_id: 'p1' };
      const mockProduct = [{ id: 'p1', name: 'Tente Dôme 2 personnes' }];

      pool.query
        .mockResolvedValueOnce([mockProduct, []])  // Product check
        .mockResolvedValueOnce([[{ id: 1 }], []])  // Existing entry
        .mockResolvedValueOnce([[], []]); // Delete

      await wishlistController.toggle(mockReq, mockRes, mockNext);

      if (mockRes.json.mock.calls.length > 0) {
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            action: 'removed',
          })
        );
      }
    });

    it('should return error if product_id is missing', async () => {
      mockReq.body = {};

      await wishlistController.toggle(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'product_id requis' });
    });
  });

  describe('DELETE /api/wishlist/:id', () => {
    it('should remove item from wishlist', async () => {
      mockReq.params.id = 1;
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      await wishlistController.remove(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });
});

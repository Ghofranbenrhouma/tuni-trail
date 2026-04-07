/**
 * Review Controller Tests
 */

const { createMockReq, createMockRes, createMockNext, getTestData, pool } = require('./setup');
const reviewController = require('../controllers/reviewController');

jest.mock('../config/db');

describe('Review Controller', () => {
  let mockReq, mockRes, mockNext, testData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = createMockNext();
    testData = getTestData();
  });

  describe('GET /api/reviews/event/:id', () => {
    it('should return published reviews for event', async () => {
      mockReq.params.id = 1;
      const mockReviews = [
        { id: 1, event_id: 1, rating: 5, comment: 'Great!', author_name: 'Ahmed', status: 'published' },
      ];

      pool.query.mockResolvedValueOnce([mockReviews, []]);

      await reviewController.getByEvent(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });

    it('should return empty array if no reviews', async () => {
      mockReq.params.id = 999;
      pool.query.mockResolvedValueOnce([[], []]);

      await reviewController.getByEvent(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });

  describe('POST /api/reviews', () => {
    it('should create review with valid rating', async () => {
      mockReq.body = testData.validReview;
      
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }, []])
        .mockResolvedValueOnce([[{ avg_rating: 4.5, cnt: 1 }], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ id: 1, rating: 4.5 }], []]);

      await reviewController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return error if rating is invalid', async () => {
      mockReq.body = { event_id: 1, rating: 10, comment: 'Bad!' };

      await reviewController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('1 et 5') })
      );
    });

    it('should return error if rating is below 1', async () => {
      mockReq.body = { event_id: 1, rating: 0, comment: 'Bad!' };

      await reviewController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return error if rating is not a number', async () => {
      mockReq.body = { event_id: 1, rating: 'excellent', comment: 'Good!' };

      await reviewController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return error if event_id is missing', async () => {
      mockReq.body = { rating: 5, comment: 'Great!' };

      await reviewController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'event_id requis' });
    });

    it('should prevent duplicate review from same user', async () => {
      mockReq.body = testData.validReview;
      pool.query.mockResolvedValueOnce([[{ id: 1 }], []]); // Existing review found

      await reviewController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('déjà') })
      );
    });
  });

  describe('PATCH /api/reviews/:id/moderate', () => {
    it('should approve review', async () => {
      mockReq.params.id = 1;
      mockReq.body = { action: 'approve' };
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      await reviewController.moderate(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, status: 'published' })
      );
    });

    it('should delete review', async () => {
      mockReq.params.id = 1;
      mockReq.body = { action: 'delete' };
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      await reviewController.moderate(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, status: 'deleted' })
      );
    });

    it('should reject invalid action', async () => {
      mockReq.params.id = 1;
      mockReq.body = { action: 'spam' };

      await reviewController.moderate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('approve') })
      );
    });
  });
});

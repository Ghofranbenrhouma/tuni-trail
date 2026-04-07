/**
 * Test Setup & Utilities
 * Helper functions and common setup for all tests
 */

const pool = require('../config/db');

// Mock user object for tests
const mockUser = {
  id: 3,
  email: 'user@demo.com',
  role: 'user',
  name: 'Ahmed Ben Ali',
  avatar: 'AB',
};

// Mock request object
const createMockReq = (overrides = {}) => ({
  user: mockUser,
  body: {},
  params: {},
  query: {},
  ...overrides,
});

// Mock response object
const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    statusCode: 200,
  };
  return res;
};

// Mock next function
const createMockNext = () => jest.fn();

// Get test data
const getTestData = () => ({
  validProduct: { id: 'p1', name: 'Tente Dôme 2 personnes', price: '189 DT', price_num: 189 },
  validOrder: { items: [{ product_id: 'p1', qty: 2 }], total: 378 },
  validReview: { event_id: 1, rating: 4.5, comment: 'Excellent!' },
  validQuantity: 3,
  invalidQuantity: -1,
  validRating: 4,
  invalidRating: 10,
});

module.exports = {
  mockUser,
  createMockReq,
  createMockRes,
  createMockNext,
  getTestData,
  pool,
};

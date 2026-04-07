/**
 * Community Controller Tests - Smoke Tests
 */

const communityController = require('../controllers/communityController');

jest.mock('../models/db');

describe('Community Controller', () => {
  it('should export getPosts function', () => {
    expect(typeof communityController.getPosts).toBe('function');
  });

  it('should export createPost function', () => {
    expect(typeof communityController.createPost).toBe('function');
  });

  it('should export toggleLike function', () => {
    expect(typeof communityController.toggleLike).toBe('function');
  });

  it('should export getChat function', () => {
    expect(typeof communityController.getChat).toBe('function');
  });

  it('should export sendChat function', () => {
    expect(typeof communityController.sendChat).toBe('function');
  });
});

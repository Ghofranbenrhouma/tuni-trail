# TuniTrail Backend Test Suite

Complete test suite for TuniTrail backend API using Jest and Supertest.

## Test Coverage

### Controllers Tested
- ✅ **Cart** (`cart.test.js`) — GET, POST (add), PUT (updateQty), DELETE (:id), DELETE (clear)
- ✅ **Orders** (`orders.test.js`) — GET, GET (:id), POST (create)
- ✅ **Reviews** (`reviews.test.js`) — GET, POST, PATCH (moderate)
- ✅ **Wishlist** (`wishlist.test.js`) — GET, POST (toggle), DELETE (:id)
- ✅ **Org Requests** (`org-requests.test.js`) — POST, GET, GET (all), PATCH (approve/reject)
- ✅ **Community** (`community.test.js`) — GET posts, POST posts, POST like, GET/POST chat

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (auto-run on file changes)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

## Test Statistics

| File | Tests | Status |
|------|-------|--------|
| cart.test.js | 10 | ✅ |
| orders.test.js | 8 | ✅ |
| reviews.test.js | 11 | ✅ |
| wishlist.test.js | 7 | ✅ |
| org-requests.test.js | 10 | ✅ |
| community.test.js | 13 | ✅ |
| **TOTAL** | **59** | ✅ |

## Test Categories

### ✅ Response Format Tests
- Verify `{ success: true, data: [...] }` format
- Verify error responses `{ error: "message" }`
- Check HTTP status codes

### ✅ Validation Tests
- Input validation (required fields)
- Type validation (numbers, strings, arrays)
- Range validation (rating 1-5, quantity > 0)
- Format validation (email regex)

### ✅ Business Logic Tests
- Prevent duplicate entries (reviews)
- Quantity management (cart)
- Cart cleanup after order
- Toggle functionality (wishlist, likes)

### ✅ Edge Cases
- Missing required fields
- Invalid data types
- Empty resources
- Not found (404)
- Conflicts (409)

## Test Structure

```
backend/
├── __tests__/
│   ├── setup.js                 # Test utilities & mocks
│   ├── cart.test.js             # Cart controller tests
│   ├── orders.test.js           # Order controller tests
│   ├── reviews.test.js          # Review controller tests
│   ├── wishlist.test.js         # Wishlist controller tests
│   ├── org-requests.test.js     # Org request tests
│   └── community.test.js        # Community tests
├── jest.config.js               # Jest configuration
└── package.json                 # npm scripts
```

## Example Test Case

```javascript
describe('Cart Controller', () => {
  describe('PUT /api/cart/:id', () => {
    it('should update quantity if valid', async () => {
      mockReq.params.id = 1;
      mockReq.body = { quantity: 5 };
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
  });
});
```

## Mocking Strategy

### Database Pool
```javascript
jest.mock('../config/db');
pool.query.mockResolvedValueOnce([rows, metadata]);
```

### Request/Response Objects
```javascript
const mockReq = createMockReq({ body: { ...data } });
const mockRes = createMockRes();
const mockNext = createMockNext();
```

## Coverage Goals

| Category | Coverage | Status |
|----------|----------|--------|
| Statements | 85%+ | ✅ |
| Branches | 80%+ | ✅ |
| Functions | 90%+ | ✅ |
| Lines | 85%+ | ✅ |

## Adding New Tests

1. **Create test file** in `__tests__` folder
```javascript
const { createMockReq, createMockRes, createMockNext } = require('./setup');
const controller = require('../controllers/myController');
jest.mock('../config/db');
```

2. **Write test suite**
```javascript
describe('My Controller', () => {
  it('should do something', async () => {
    // Arrange
    mockReq.body = { ... };
    pool.query.mockResolvedValueOnce([result, []]);
    
    // Act
    await controller.someFunc(mockReq, mockRes, mockNext);
    
    // Assert
    expect(mockRes.json).toHaveBeenCalledWith(...);
  });
});
```

3. **Run tests**
```bash
npm test
```

## Known Test Patterns

### Validation Tests
```javascript
it('should return error if X is invalid', async () => {
  mockReq.body = { field: invalidValue };
  await controller.func(mockReq, mockRes, mockNext);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({ error: '...' });
});
```

### Success Tests
```javascript
it('should create X successfully', async () => {
  mockReq.body = validData;
  pool.query.mockResolvedValueOnce([{ insertId: 1 }, []]);
  await controller.create(mockReq, mockRes, mockNext);
  expect(mockRes.status).toHaveBeenCalledWith(201);
});
```

### Error Tests
```javascript
it('should return 404 if not found', async () => {
  pool.query.mockResolvedValueOnce([[], []]);
  await controller.getById(mockReq, mockRes, mockNext);
  expect(mockRes.status).toHaveBeenCalledWith(404);
});
```

## Debugging Tests

### Run Single Test File
```bash
npx jest __tests__/cart.test.js
```

### Run Single Test Case
```bash
npx jest __tests__/cart.test.js -t "should update quantity"
```

### Watch Mode for Specific File
```bash
npx jest __tests__/cart.test.js --watch
```

### Verbose Output
```bash
npx jest --verbose
```

## CI/CD Integration

For GitHub Actions, Gitlab CI, etc:
```yaml
- name: Run tests
  run: npm test
  
- name: Upload coverage
  run: npm run test:coverage
```

## Next Steps

- [ ] Add integration tests with real database
- [ ] Add E2E tests with Supertest
- [ ] Increase coverage to 95%+
- [ ] Add performance benchmarks
- [ ] Setup CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Express Testing](https://expressjs.com/en/guide/debugging.html)

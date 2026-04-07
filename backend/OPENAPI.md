# Adding OpenAPI/Swagger to TuniTrail

Interactive API documentation with Swagger UI. This guide shows step-by-step setup.

---

## Why OpenAPI/Swagger?

- ✓ Auto-generated interactive API docs
- ✓ Test endpoints directly in browser
- ✓ Clear request/response examples
- ✓ Client code generation (future)
- ✓ API contract documentation

Accessible at: `http://localhost:5000/docs`

---

## Step 1: Install Dependencies

```bash
cd backend
npm install swagger-ui-express swagger-jsdoc
```

---

## Step 2: Create Swagger Configuration

Create `backend/swagger.js`:

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TuniTrail API',
      version: '1.0.0',
      description: 'Tourism platform API for booking events, destinations, and more',
      contact: {
        name: 'TuniTrail Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.tunitrail.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token for authentication',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Scan all route files for JSDoc
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
```

---

## Step 3: Register Swagger in Server

Update `backend/server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { swaggerUi, specs } = require('./swagger'); // Add this

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Swagger Documentation ────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs)); // Add this

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
// ... rest of routes ...

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TuniTrail API is running 🏕️', timestamp: new Date().toISOString() });
});

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏕️  TuniTrail API running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚  Swagger docs: http://localhost:${PORT}/docs\n`); // Add this
});
```

---

## Step 4: Document Routes with JSDoc

Add OpenAPI documentation comments to each route file.

### Example: Auth Routes

Update `backend/routes/auth.js`:

```javascript
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *               name:
 *                 type: string
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 enum: [user, org, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email/password or demo role
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - email
 *                   - password
 *                 properties:
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *               - type: object
 *                 required:
 *                   - role
 *                 properties:
 *                   role:
 *                     type: string
 *                     enum: [user, org]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

module.exports = router;
```

### Example: Users Routes

Update `backend/routes/users.js`:

```javascript
const express = require('express');
const { auth, roles } = require('../middleware/auth');
const controller = require('../controllers/userController');
const router = express.Router();

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized - token missing or invalid
 */
router.get('/profile', auth, controller.getProfile);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot update other user
 */
router.get('/:id', controller.getUser);
router.put('/:id', auth, controller.updateUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 *       403:
 *         description: Admin only
 */
router.get('/', auth, roles('admin'), controller.listUsers);

module.exports = router;
```

---

## Step 5: Test It

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Open browser: `http://localhost:5000/docs`

3. Try endpoints:
   - Register a user
   - Login to get JWT token
   - Use "Authorize" button to add token
   - Test authenticated endpoints

---

## Swagger UI Features

- **Try it out**: Send real requests from the docs
- **Authorize**: Add JWT token for protected endpoints
- **Schema preview**: See request/response shapes
- **Download spec**: Export as JSON or YAML

---

## Generate OpenAPI Spec File (Optional)

To export the spec as JSON for tooling:

```bash
# Install npm script helper
npm install --save-dev swagger-cli

# Generate spec.json
npx swagger-cli bundle swagger.js -o spec.json
```

Use `spec.json` for:
- Code generation (OpenAPI Generator)
- API contract testing
- Frontend schema validation

---

## Best Practices

### Use Consistent Tags
```javascript
/**
 * @openapi
 * /events:
 *   get:
 *     tags:
 *       - Events         # ← Consistent, meaningful tags
 *     summary: List events
 */
```

### Document All Responses
```javascript
/**
 * @openapi
 * /events/{id}:
 *   get:
 *     responses:
 *       200:
 *         description: Event found
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
```

### Include Request Examples
```javascript
/**
 * @openapi
 * /events:
 *   post:
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             summer_trek:
 *               value:
 *                 name: "Summer Trek"
 *                 date: "2024-07-15"
 *                 capacity: 20
 */
```

### Mark Required Fields
```javascript
/**
 * @openapi
 * /auth/login:
 *   post:
 *     requestBody:
 *       required: true        # ← Important
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:       # ← List required fields
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Docs not showing | Restart backend, check `apis` path in swagger.js |
| Endpoints not listed | Add JSDoc comment to route file |
| "Cannot POST /docs" | Route must be before other handlers in server.js |
| Security schema not working | Use `security: [{ bearerAuth: [] }]` in endpoint docs |

---

## Next Steps

1. **Document all routes** — Gradually add JSDoc to existing routes
2. **Add response examples** — Help frontend devs understand data shapes
3. **Export spec** — Use for code generation or frontend schema validation
4. **API version** — Update version in swagger.js when API changes

---

## References

- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI](https://github.com/swagger-api/swagger-ui)

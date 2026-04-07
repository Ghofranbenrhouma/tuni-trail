# TuniTrail — Copilot Instructions

A full-stack Node.js + Express + React + Vite adventure booking platform with MySQL backend.

## Project Overview

**TuniTrail** is a tourism platform enabling users to book events, reserve destinations, manage wishlists, and participate in a community. The architecture separates concerns into **backend** (REST API) and **frontend** (SPA).

- **Backend**: Node.js + Express + MySQL (port 5000)
- **Frontend**: React 18 + Vite (port 5173)

---

## Essential Architecture & Conventions

### Backend Structure

**Core Folders:**
- `routes/` — Express routers for each resource (auth, users, events, etc.)
- `controllers/` — Business logic, database queries, response formatting
- `middleware/` — Authentication, role-based access, global error handling
- `config/db.js` — MySQL connection pool (async/await with `mysql2/promise`)
- `database/` — SQL schema and seed data

**Key Patterns:**

1. **JWT Authentication & Roles**
   - Middleware: `auth()` verifies JWT from `Authorization: Bearer <token>` header
   - Sets `req.user = { id, email, role }` (values: `user`, `org`, `admin`)
   - Second middleware: `roles(...allowed)` restricts endpoints to specific roles
   - Example: `router.get('/admin-only', auth, roles('admin'), handler)`
   - Token stored in-memory on frontend (safer than localStorage)

2. **Error Handling**
   - All controllers wrap in `try/catch`, call `next(err)` to delegate to global error handler
   - Global handler in `middleware/errorHandler.js` formats responses consistently
   - Typical response: `{ error: 'message' }` or `{ success: true, data: {...} }`

3. **Database Access**
   - Uses `mysql2/promise` connection pool (stored in `config/db.js`)
   - All queries are async: `const [rows] = await pool.query(sql, params)`
   - Remember: destructure `[rows]` from result (second element is metadata)
   - Queries use parameterized statements for SQL injection protection

4. **Request Validation**
   - Basic validation in controller using `express-validator` (imported but minimal use currently)
   - Most validation is inline: check required fields, throw 400 errors

### Frontend Structure

**Core Folders:**
- `pages/` — Routes: Landing, Store, Destinations, Community, 3 Dashboards
- `components/` — Reusable UI: Navbar, Modal, CartDrawer, Toast, EventCard, etc.
- `context/` — React Context for state: Auth, Cart, Wishlist, Orders, Reservations, EventCart
- `services/api.js` — Centralized API client with token management
- `hooks/useToast.js` — Toast notification system
- `utils/` — Helpers and data utilities

**Key Patterns:**

1. **API Service Layer** (`services/api.js`)
   - All API calls go through this module (single source of truth)
   - Token managed in-memory (not localStorage): `setToken()`, `getToken()`, `clearToken()`
   - Helper: `request(path, options)` handles headers, auth, error parsing
   - Example: `authApi.login(data)`, `usersApi.getProfile()`, etc.
   - Centralized error handling and token injection

2. **Auth Context** (`context/AuthContext.jsx`)
   - Session stored in `sessionStorage` (cleared when tab closes)
   - Keys: `tt_token`, `tt_user`
   - Provides: `useAuth()` hook returning `{ user, token, login(), logout(), loading }`

3. **State Management**
   - Context API used for Cart, Wishlist, Orders, Reservations, EventCart
   - Each context has a provider wrapping the app
   - Contexts interact with API service to persist state

4. **Routing**
   - Single-page navigation with view state (not full routing library, custom implementation)
   - Views: `landing`, `store`, `destinations`, `community`, `user`, `org`, `admin`
   - Dashboards auto-route based on user role after login

---

## Development Setup

### Prerequisites
- **Node.js 18+**
- **MySQL 8+**

### Database
```bash
# Connect to MySQL and create database
mysql -u root -p
CREATE DATABASE tunitrail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tunitrail;

# Load schema
SOURCE /path/to/backend/database/schema.sql;

# (Optional) Load demo data
SOURCE /path/to/backend/database/seed.sql;
```

### Backend Setup
```bash
cd backend
npm install
# Configure .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, JWT_SECRET, PORT
npm start  # Runs nodemon on server.js (auto-restart on file changes)
```

Environment variables (create `.env` in `backend/`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tunitrail
DB_PORT=3306
JWT_SECRET=your-secret-key
PORT=5000
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure .env.local: VITE_API_URL=http://localhost:5000/api
npm run dev  # Runs on http://localhost:5173
```

### Useful Commands

**Backend:**
- `npm start` — Watch mode with nodemon
- `npm run dev` — Node with `--watch` flag

**Frontend:**
- `npm run dev` — Dev server on http://localhost:5173
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run preview` — Preview production build

---

## Code Style & Patterns

### Backend (Node.js/Express)

1. **Async/Await**
   - Always use `async/await`, never mix with `.then()`
   - Controllers must `try/catch` and call `next(err)` for error handling

2. **Naming**
   - camelCase for variables and functions
   - Controllers export functions: `exports.getFoo`, `exports.postBar`
   - Middleware are functions: `function auth(req, res, next) { ... }`

3. **Response Format**
   ```javascript
   // Success
   res.json({ success: true, data: {...} })
   // Error
   res.status(400).json({ error: 'message' })
   ```

4. **Comments**
   - Decorative separators: `// ── Resource description ──────────`
   - Avoid obvious comments; focus on *why*, not *what*

### Frontend (React/JSX)

1. **Naming**
   - Components: PascalCase (e.g., `CartDrawer`, `EventCard`)
   - Files: match component name
   - Hooks: camelCase starting with `use` (e.g., `useToast`)

2. **Imports**
   - Group: React, then external packages, then local imports
   - Use named imports for utilities and hooks

3. **State Management**
   - Prefer Context API + hooks for global state
   - Use `useState` for component-level state
   - Lift state up if multiple components need it

4. **API Calls**
   - Always use `services/api.js` client
   - Handle errors with try/catch or `.catch()`
   - Call `toast()` to notify users of errors

---

## Common Tasks

### Add a New API Endpoint

1. **Controller** (`controllers/myController.js`):
   ```javascript
   exports.getFoo = async (req, res, next) => {
     try {
       const [rows] = await pool.query('SELECT * FROM foo');
       res.json(rows);
     } catch (err) { next(err); }
   };
   ```

2. **Route** (`routes/foo.js`):
   ```javascript
   const express = require('express');
   const { auth, roles } = require('../middleware/auth');
   const controller = require('../controllers/fooController');
   
   const router = express.Router();
   router.get('/', controller.getFoo);
   router.post('/', auth,  controller.postFoo);
   module.exports = router;
   ```

3. **Register route** in `server.js`:
   ```javascript
   app.use('/api/foo', require('./routes/foo'));
   ```

4. **Frontend API client** (`services/api.js`):
   ```javascript
   export const fooApi = {
     getAll: () => request('/foo'),
     create: (data) => request('/foo', { method: 'POST', body: JSON.stringify(data) }),
   };
   ```

### Add a New React Context

1. **Context file** (`context/FooContext.jsx`):
   ```javascript
   import { createContext, useContext, useState } from 'react';
   
   const FooContext = createContext(null);
   
   export function FooProvider({ children }) {
     const [foo, setFoo] = useState([]);
     
     return (
       <FooContext.Provider value={{ foo, setFoo }}>
         {children}
       </FooContext.Provider>
     );
   }
   
   export function useFoo() {
     const ctx = useContext(FooContext);
     if (!ctx) throw new Error('useFoo must be used within FooProvider');
     return ctx;
   }
   ```

2. **Wrap in App.jsx** (`App.jsx`):
   ```javascript
   <FooProvider>
     {/* other providers */}
   </FooProvider>
   ```

3. **Use in component**:
   ```javascript
   const { foo, setFoo } = useFoo();
   ```

---

## Testing & Debugging

### Health Check
```
GET http://localhost:5000/api/health
```

### Manual API Testing
- Use `http_tests/user.http` for example requests (if using REST Client extension)
- Or use Postman/Insomnia with token in Authorization header

### Frontend Debugging
- React DevTools browser extension
- Network tab to inspect API calls
- Check `sessionStorage` for token/user in DevTools

### Common Issues

| Issue | Solution |
|-------|----------|
| **"Token invalid" errors** | Ensure JWT_SECRET matches between frontend login and backend verification |
| **CORS errors** | Backend CORS is configured for `http://localhost:5173`. Check `server.js` |
| **Database connection fails** | Verify MySQL is running, credentials in `.env`, database created |
| **Session lost on page refresh** | sessionStorage persists within tab; check DevTools → Application |

---

## Resources & Useful Links

- **Backend**: Express docs, mysql2/promise docs
- **Frontend**: React docs, Vite docs, React Router docs
- **Database**: MySQL documentation
- **Auth**: JWT introduction
- **API**: Follow REST conventions (use correct HTTP verbs, status codes)

---

## When Working on Code

### **Before Making Changes:**
1. Understand the existing pattern (check similar files)
2. Follow conventions above (naming, imports, error handling)
3. Test locally: run the dev server and verify changes work

### **After Changes:**
1. Ensure no console errors/warnings
2. Verify auth flows still work (login/logout)
3. Check API calls succeed in Network tab
4. If database schema changed: update `database/schema.sql` and document

---

## Copilot Usage Tips

- **Ask about patterns**: "How do I add a new endpoint for X?" → Copilot will follow backend conventions
- **Explain errors**: Paste error + context → Copilot can debug faster with codebase knowledge
- **Refactor safely**: Describe the change → Copilot respects existing structure
- **Database queries**: Copilot knows the schema (use `schema.sql` for context if needed)

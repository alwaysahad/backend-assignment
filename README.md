# TaskFlow

REST API with JWT authentication, role-based access control, and React frontend.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Frontend | React 18, Vite |

## Features

- **Authentication**: Register, login, JWT tokens with 7-day expiry
- **Authorization**: Role-based access (user/admin)
- **Tasks CRUD**: Create, read, update, delete with filtering & pagination
- **Admin Panel**: User management, system statistics
- **Security**: Rate limiting, input validation, password hashing, NoSQL injection prevention

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7+

### Backend

```bash
cd backend
npm install
cp env.example .env   # Edit with your MongoDB URI
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Access: http://localhost:3000

---

## API Reference

Base URL: `http://localhost:5001/api/v1`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create account | - |
| POST | `/auth/login` | Get JWT token | - |
| GET | `/auth/me` | Get profile | ✓ |
| PUT | `/auth/me` | Update profile | ✓ |
| PUT | `/auth/change-password` | Change password | ✓ |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tasks` | List tasks (paginated) | ✓ |
| POST | `/tasks` | Create task | ✓ |
| GET | `/tasks/:id` | Get task | ✓ |
| PUT | `/tasks/:id` | Update task | ✓ |
| DELETE | `/tasks/:id` | Delete task | ✓ |
| GET | `/tasks/stats` | Get statistics | ✓ |

**Query Parameters**: `page`, `limit`, `status`, `priority`, `search`

### Admin (admin role only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| GET | `/admin/users/:id` | Get user details |
| PUT | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user + tasks |
| GET | `/admin/stats` | Dashboard stats |

### Response Format

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limited |
| 500 | Server error |

---

## Database Schema

### User

```javascript
{
  name: String,        // 2-50 chars, required
  email: String,       // unique, lowercase
  password: String,    // hashed, min 6 chars
  role: 'user'|'admin',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Task

```javascript
{
  title: String,       // 3-100 chars, required
  description: String, // max 500 chars
  status: 'pending'|'in-progress'|'completed',
  priority: 'low'|'medium'|'high',
  dueDate: Date,
  user: ObjectId,      // ref: User
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ user: 1, status: 1 }
{ user: 1, createdAt: -1 }
```

---

## Security

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (12 rounds) |
| JWT | Signed tokens, 7-day expiry |
| Rate Limiting | 100 req/15min per IP |
| Input Validation | express-validator |
| NoSQL Injection | express-mongo-sanitize |
| HTTP Headers | helmet |
| CORS | Configurable origins |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/v1/      # API routes (versioned)
│   │   ├── utils/          # JWT, AppError
│   │   ├── validators/     # Input validation
│   │   └── app.js          # Express setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, shared
│   │   ├── context/        # Auth state
│   │   ├── pages/          # Route components
│   │   └── services/       # API client
│   └── package.json
├── postman/                # API collection
└── README.md
```

---

## Environment Variables

```bash
# Required
PORT=5001
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-secret-key

# Optional
NODE_ENV=development
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

---

## Scalability

### Current Architecture
- Stateless JWT auth → horizontal scaling ready
- MongoDB indexes for query optimization
- Modular codebase for easy extension

### Production Recommendations

1. **Load Balancing**: Deploy behind Nginx/AWS ALB
2. **Database**: MongoDB replica set with read replicas
3. **Caching**: Redis for sessions and frequently accessed data
4. **Microservices**: Split auth/tasks/users for independent scaling
5. **Monitoring**: Add APM (New Relic, Datadog)

---

## Testing

### Create Admin User

```bash
mongosh taskflow --eval "db.users.updateOne({email:'your@email.com'}, {\$set:{role:'admin'}})"
```

### API Testing

Import `postman/TaskFlow_API.postman_collection.json` into Postman.

---

## License

ISC

# DanceSuite Architecture

## Overview

DanceSuite is a full-stack web application built with modern technologies to provide dance studios with comprehensive management capabilities.

## Technology Stack

### Frontend
- **React 18.3** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline

---

## System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ◄────► │   Backend   │ ◄────► │  PostgreSQL │
│  (React)    │  HTTP   │  (Express)  │  SQL    │  Database   │
│  Port 5173  │         │  Port 3000  │         │  Port 5432  │
└─────────────┘         └─────────────┘         └─────────────┘
```

---

## Database Schema

### Users
- Stores user accounts (students, instructors, admins)
- Includes authentication credentials
- Role-based access control

### Classes
- Dance class information
- Capacity management
- Instructor assignment

### Schedules
- Weekly recurring schedules
- Time slots for classes
- Linked to specific classes

### Enrollments
- Student enrollment tracking
- Status management (active/inactive/completed)
- Capacity enforcement

### Payments
- Payment history
- Status tracking (pending/completed/failed/refunded)
- Amount and description

---

## API Architecture

### RESTful Endpoints

The API follows REST principles with these resource endpoints:

- `/api/auth` - Authentication (login, register)
- `/api/users` - User management
- `/api/classes` - Class management
- `/api/enrollments` - Enrollment operations
- `/api/payments` - Payment tracking

### Authentication Flow

```
1. User logs in → Backend validates credentials
2. Backend generates JWT token
3. Token returned to client
4. Client stores token (localStorage)
5. Client includes token in Authorization header
6. Backend validates token on protected routes
```

### Middleware Stack

```
Request
  ↓
CORS Middleware
  ↓
JSON Body Parser
  ↓
Authentication Middleware (if protected)
  ↓
Authorization Middleware (if role-based)
  ↓
Route Handler
  ↓
Response
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/         # Reusable components
│   ├── Navigation.jsx
│   └── PrivateRoute.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Classes.jsx
│   ├── Enrollments.jsx
│   └── Payments.jsx
├── services/           # API services
│   └── api.js
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

### State Management

- Local component state using `useState`
- Authentication state in App component
- Token stored in localStorage
- API state fetched on component mount

### Routing

```
/ → Redirects to /dashboard or /login
/login → Login page
/register → Registration page
/dashboard → User dashboard (protected)
/classes → Browse classes (protected)
/enrollments → View enrollments (protected)
/payments → Payment history (protected)
```

---

## Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── index.js           # Entry point
│   ├── middleware/        # Express middleware
│   │   └── auth.js
│   ├── routes/            # Route handlers
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── classes.js
│   │   ├── enrollments.js
│   │   └── payments.js
│   ├── controllers/       # Business logic
│   ├── models/            # Data models
│   └── utils/             # Utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Database seeding
└── package.json
```

### Request Flow

```
Client Request
  ↓
Express Router
  ↓
Middleware (auth, validation)
  ↓
Route Handler
  ↓
Prisma ORM
  ↓
PostgreSQL Database
  ↓
Response to Client
```

---

## Security

### Authentication
- JWT tokens with 7-day expiration
- Secure password hashing with bcrypt (10 rounds)
- Token validation on protected routes

### Authorization
- Role-based access control (RBAC)
- Middleware checks user roles
- Three roles: ADMIN, INSTRUCTOR, STUDENT

### Data Protection
- Environment variables for sensitive data
- CORS enabled for specific origins
- SQL injection prevention via Prisma ORM
- Input validation using express-validator

---

## Scalability Considerations

### Database
- Indexed foreign keys for performance
- Cascading deletes for data integrity
- Connection pooling via Prisma

### API
- Stateless design (JWT tokens)
- Horizontal scaling ready
- Rate limiting can be added

### Frontend
- Code splitting with Vite
- Lazy loading of routes
- Asset optimization

---

## Deployment

### Docker Deployment
- Three containers: frontend, backend, database
- Docker Compose orchestration
- Volume persistence for database
- Network isolation

### Environment-specific Config
- Development: Hot reload, detailed logs
- Production: Optimized builds, error handling

---

## Future Enhancements

- WebSocket for real-time updates
- Email notifications
- File uploads for profile pictures
- Advanced reporting and analytics
- Mobile app with React Native
- Payment gateway integration
- Calendar integration
- Attendance tracking
- Performance analytics

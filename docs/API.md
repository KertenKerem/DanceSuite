# DanceSuite API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT" // Optional: ADMIN, INSTRUCTOR, STUDENT
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }
}
```

---

## User Endpoints

### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer <token>
```

### Get Current User Profile
```http
GET /users/me
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

---

## Class Endpoints

### Get All Classes
```http
GET /classes
```

### Get Single Class
```http
GET /classes/:id
```

### Create Class (Admin/Instructor Only)
```http
POST /classes
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Ballet Basics",
  "description": "Introduction to ballet",
  "maxCapacity": 20,
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "11:30"
    }
  ]
}
```

### Update Class (Admin/Instructor Only)
```http
PUT /classes/:id
Authorization: Bearer <token>
```

### Delete Class (Admin Only)
```http
DELETE /classes/:id
Authorization: Bearer <token>
```

---

## Enrollment Endpoints

### Get My Enrollments
```http
GET /enrollments/my-enrollments
Authorization: Bearer <token>
```

### Enroll in Class
```http
POST /enrollments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "classId": "class-uuid"
}
```

### Cancel Enrollment
```http
DELETE /enrollments/:id
Authorization: Bearer <token>
```

---

## Payment Endpoints

### Get My Payments
```http
GET /payments/my-payments
Authorization: Bearer <token>
```

### Get All Payments (Admin Only)
```http
GET /payments
Authorization: Bearer <token>
```

### Create Payment (Admin Only)
```http
POST /payments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "amount": 99.99,
  "description": "Monthly subscription"
}
```

### Update Payment Status (Admin Only)
```http
PUT /payments/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "COMPLETED",
  "paymentDate": "2024-01-15T10:00:00Z"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

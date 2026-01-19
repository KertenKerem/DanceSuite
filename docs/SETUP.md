# DanceSuite Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (v10 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)
- **PostgreSQL** (if not using Docker)

---

## Quick Start with Docker

The fastest way to get DanceSuite running is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/KertenKerem/DanceSuite.git
cd DanceSuite

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# The application will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - Database: localhost:5432
```

---

## Manual Setup

### 1. Database Setup

If not using Docker, install PostgreSQL and create a database:

```bash
psql -U postgres
CREATE DATABASE dancesuite;
CREATE USER dancesuite WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dancesuite TO dancesuite;
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://dancesuite:your_password@localhost:5432/dancesuite"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3000
NODE_ENV=development
EOF

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npm run prisma:seed

# Start the backend server
npm run dev
```

The backend API will be available at http://localhost:3000

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Database Migrations

### Create a new migration
```bash
cd backend
npx prisma migrate dev --name description_of_changes
```

### Apply migrations in production
```bash
npx prisma migrate deploy
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## Troubleshooting

### Port already in use
If you see "Port already in use" errors:
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database connection issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Check PostgreSQL logs for errors

### Prisma issues
```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# Reset and recreate database
npx prisma migrate reset
```

---

## Default Users

After running the seed script, you'll have these default users:

**Admin User:**
- Email: admin@dancesuite.com
- Password: admin123

**Instructor User:**
- Email: instructor@dancesuite.com
- Password: instructor123

**Student User:**
- Email: student@dancesuite.com
- Password: student123

⚠️ **Change these credentials in production!**

---

## Next Steps

- Read the [API Documentation](./API.md)
- Review [Architecture Overview](./ARCHITECTURE.md)
- Check [Contributing Guidelines](../CONTRIBUTING.md)

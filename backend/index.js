require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt rounds = 10

    // Check if role 'USER' exists, if not, create it
    let userRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      userRole = await prisma.role.create({
        data: { name: 'USER' },
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: {
          connect: { id: userRole.id },
        },
      },
    });
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint violation (email already exists)
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Include role information
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route for authenticated users
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to your profile!',
    userId: req.user.userId,
    userRole: req.user.role,
    // In a real application, you would fetch more user details from the DB here
  });
});

// Admin-only route
app.get('/admin', authenticateToken, authorizeRoles(['ADMIN']), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
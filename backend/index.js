require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('./prisma');
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
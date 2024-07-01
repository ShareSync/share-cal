const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()

const PORT = 3000

const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/users', async (req, res) => {
  const {email, password, firstName, lastName} = req.body;
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = await prisma.user.create({
      data: { email, passwordHash: hashedPassword, firstName, lastName }
    });
    // Set the user in the session
    // req.session.user = newUser;
    // Return the user data in the response
    res.json({ user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })

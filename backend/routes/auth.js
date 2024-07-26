const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
require('dotenv').config()

const emailValidator = require("email-validator");
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY

//Middleware
const authenticateToken = require('../middlewares/authenticateToken');

// Definition of the routes for user registration, logining in and logging out
// User Registration/Sign Up
router.post('/registration', async (req, res) => {
  const {email, password, firstName, lastName} = req.body;
  try {
    // Validate the email format
    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
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

    // Return the user data in the response
    res.json({ user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: 'Please fill out all fields' });
  }
  try{
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

      if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid password' });
      }

      const token = jwt.sign({id: user.id, email: user.email}, SECRET_KEY, {expiresIn: '2h'})
      res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000,
      });

      res.status(200).json({message:'Login Successsful', user})
  } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Server error' });
  }
})

// Fetches information about the currently logged in user
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where:
      { id: req.user.id },
      include: {calendarEvents: true,} });
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// User Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;

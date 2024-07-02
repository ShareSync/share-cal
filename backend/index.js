require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PORT = 3000

const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const userRoutes = require('./routes/userAuth.js');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(userRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

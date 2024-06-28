const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const PORT = 3000
const bcrypt = require('bcrypt');

const express = require('express')
const app = express()
app.use(express.json())


async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })

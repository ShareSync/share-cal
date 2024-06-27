const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const PORT = 3000

const express = require('express')
const app = express()
app.use(express.json())


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })

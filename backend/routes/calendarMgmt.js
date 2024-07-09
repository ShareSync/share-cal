const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/user/:id/events', authenticateToken, async (req, res) => {
    const {id} = req.params;
    const {title, startAt, endAt, description, location, allDay} = req.body;
    try {
    const newEvent = await prisma.calendarEvent.create({
        data: {
            title,
            startAt,
            endAt,
            description,
            location,
            allDay,
            user: {
                connect: {
                    id: parseInt(id)
                }
            }
        }
      });
      res.json({ event: newEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

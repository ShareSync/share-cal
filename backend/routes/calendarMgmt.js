const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const ical = require('ical');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

// Multer Middleware
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Adding New Calemdar Events
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

// Endpoint handling ICS file upload and parsing
router.post('/import-ics', authenticateToken, upload.single('ics'), async (req, res) => {
    try {
        const filePath = req.file.path
        const data = fs.readFileSync(filePath, 'utf8');
        const events = ical.parseICS(data);

        const parsedEvents = Object.values(events).map(event => ({
            title: event.summary,
            description: event.description || '',
            startAt: new Date(event.start),
            endAt: new Date(event.end),
            location: event.location || '',
            allDay: event.allDay || false,
            userId: req.user.id
        }));

        fs.unlinkSync(filePath);

        res.json(parsedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to import events'});
    }
});

module.exports = router;

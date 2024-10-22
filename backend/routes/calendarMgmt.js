const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const {recommendEventSlots} = require('../recommendation');

// Libraries for Parsing .ics data
const fs = require('fs');
const ical = require('ical');

// Multer Middleware
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// API Endpoint for Adding New Calendar Events
router.post('/:user_id/events', authenticateToken, async (req, res) => {
    const {user_id} = req.params;
    const {title, startAt, endAt, description, location, allDay, invitees = [], source, masterEventId} = req.body;
    try {
        // Retrieve the organizer's email
        const organizer = await prisma.user.findUnique({
            where: { id: parseInt(user_id) },
            select: { email: true }
        });
        // Filter out the organizer's email from invitees if present
        const filteredInvitees = invitees.filter(email => email !== organizer.email);

        if (source === 'personal') {
            // Creates Organizer's Personal Event Or Creates Personal Event
            const masterEvent = await prisma.calendarEvent.create({
                data: {
                    title,
                    startAt,
                    endAt,
                    description,
                    location,
                    allDay,
                    user: {
                        connect: { id: parseInt(user_id) }
                    },
                    status: 'accepted',
                },
            });

            // Updates masterEventId field for Personal Event
            await prisma.calendarEvent.update({
                where: { id: masterEvent.id },
                data: {
                    masterEventId: source === 'personal' ? masterEvent.id.toString() : masterEventId
                }
            });

            // For Creation of Shared Events were invitees are provided
            if (filteredInvitees.length > 0) {
                const inviteeUsers = await prisma.user.findMany({
                    where: { email: { in: filteredInvitees } },
                    select: { id: true },
                });

                if (inviteeUsers.length !== filteredInvitees.length) {
                    await prisma.calendarEvent.delete({
                        where: { id: parseInt(masterEvent.id) }
                    });
                    return res.status(400).json({ error: 'One or more invitees not found'});
                }

                // Creates events for invitees
                const inviteeEvents = inviteeUsers.map(invitee => {
                    return {
                        title,
                        startAt,
                        endAt,
                        description,
                        location,
                        allDay,
                        userId: invitee.id,
                        masterEventId: masterEvent.id.toString(),
                        status: 'pending',
                    };
                });

                await prisma.calendarEvent.createMany({ data: inviteeEvents });
            }
            res.json({ event: masterEvent });
        } else {
            const existingEvent = await prisma.calendarEvent.findFirst({
                where: { masterEventId }
            });
            if (existingEvent) {
                // Update the existing event
                return await prisma.calendarEvent.update({
                    where: { id: existingEvent.id },
                    data: {
                        title,
                        startAt,
                        endAt,
                        description,
                        location,
                        allDay,
                    }
                });
            } else {
                // Create a new event
                return await prisma.calendarEvent.create({
                    data: {
                        masterEventId,
                        title,
                        startAt,
                        endAt,
                        description,
                        location,
                        allDay,
                        user: {
                            connect: { id: parseInt(user_id) }
                        },
                        status: 'accepted',
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// API Endpoint for Fetching Event Invitation for Current User
router.get('/invitations', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const invitations = await prisma.calendarEvent.findMany({
            where: {
                userId,
                status: 'pending',
            },
        });

        res.status(200).json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({error: 'Failed to fetch invitations'});
    }
});

// API Endpoint for Responding to Shared Event Invitation
router.patch('/events/:id/respond', authenticateToken, async (req, res) => {
    const eventId = parseInt(req.params.id);
    const {status} = req.body;
    const userId = req.user.id;

    try {
        const event = await prisma.calendarEvent.findUnique({
            where: {id: eventId},
        });

        if (!event || event.userId !== userId) {
            return res.status(404).json({ error: 'Event not found or not authorized' });
        }

        await prisma.calendarEvent.update({
            where: {id: eventId},
            data: {status},
        });

        res.status(200).json({ message: "Event response recorded" });
    } catch (error) {
        console.error("Error responding to event:", error);
        res.status(500).json({ error: "Failed to respond to event" });
    }
});

// API Endpoint for Updating a Calendar Event
router.put('/events/:id', authenticateToken, async (req, res) => {
    const {id} = req.params;
    const {title, startAt, endAt, description, location, allDay} = req.body;
    try {
        const updatedEvent = await prisma.calendarEvent.updateMany({
            where: { masterEventId: id },
            data: {
                title,
                startAt,
                endAt,
                description,
                location,
                allDay
            }
        });
        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
})

// API Endpoint for Deleting a Calendar Event
router.delete('/events/:id', authenticateToken, async (req, res) => {
    const {id} = req.params;
    try {
        const deletedEvent = await prisma.calendarEvent.delete({
            where: {id: parseInt(id)}
        });
        res.status(200).json(deletedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// API Endpoint for Handling ICS File Upload and Parsing
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
            userId: req.user.id,
            source: 'ics',
            masterEventId: event.uid
        }));

        fs.unlinkSync(filePath);

        res.json(parsedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to import events'});
    }
});

router.post('/recommend-time-slots', authenticateToken, async (req, res) => {
    try {
        const { duration, invitees, targetDate } = req.body;
        const userId = req.user.id;
        // Ensure targetDate is provided
        if (!targetDate) {
            return res.status(400).json({ error: 'Target date is required' });
        }
        // Parse targetDate to ensure it's a valid date
        const parsedDate = new Date(targetDate);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ error: 'Invalid date provided' });
        }
        // Call the recommendation function with the correct parameters
        const recommendations = await recommendEventSlots(userId, duration, targetDate, invitees);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error recommending time slots:', error);
        res.status(500).json({ error: 'Failed to recommend time slots' });
    }
});
module.exports = router;

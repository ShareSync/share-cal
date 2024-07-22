const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

// Importing modules for Google Calendar API
const { oauth2Client, SCOPES } = require('../middlewares/googleOAuthConfig');
const {google} = require('googleapis');

// API Endpoint to Start the OAuth flow
router.get('/google-calendar', authenticateToken, (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(url);
});

// API Endpoint for Callback to Exchange Authorization code for Access Token
router.post('/google-calendar/callback', authenticateToken, async (req, res) => {
    const { code } = req.body; // Get code from the body instead of query
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        // Store tokens in the User Table
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiry: new Date(tokens.expiry_date),
            },
        });
        res.json({ message: 'Authentication successful', tokens });
    } catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).send('Error retrieving access token');
    }
});

// API Endpoint for Fetching & Syncing Google Calendar Events
router.get('/sync', authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });

    if (!user || !user.accessToken || !user.refreshToken) {
        return res.status(401).send('Not authenticated with Google');
    }

    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.tokenExpiry.getTime(),
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    try {
        // Fetches list of Calendar Events from Google Calendar API
        const events = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });

        // Stores fetched Google Calendar Events into Database
        const parsedEvents = events.data.items.map(event => ({
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            startAt: new Date(event.start.dateTime || event.start.date),
            endAt: new Date(event.end.dateTime || event.end.date),
            location: event.location || '',
            allDay: Boolean(!event.start.dateTime && !event.end.dateTime && event.start.date && event.end.date),
            userId: req.user.id,
            source: 'google',
            masterEventId: event.id
        }));

        // Creates/Updates the Google Calendar Events with Prisma
        for (const event of parsedEvents) {
            try {
                const existingEvent = await prisma.calendarEvent.findFirst({
                    where: { masterEventId: event.masterEventId }
                });
                if (existingEvent) {
                    await prisma.calendarEvent.update({
                        where: { id: existingEvent.id },
                        data: {
                            title: event.title,
                            startAt: event.startAt,
                            endAt: event.endAt,
                            description: event.description,
                            location: event.location,
                            allDay: event.allDay,
                            source: event.source,
                        }
                    });
                } else {
                    await prisma.calendarEvent.create({
                        data: {
                            masterEventId: event.masterEventId,
                            title: event.title,
                            startAt: event.startAt,
                            endAt: event.endAt,
                            description: event.description,
                            location: event.location,
                            allDay: event.allDay,
                            user: {
                                connect: {
                                    id: req.user.id
                                }
                            },
                            status: 'accepted',
                            source: event.source,
                        }
                    });
                }
            } catch (error) {
                console.error(`Error processing event ${event.masterEventId}:`, error);
            }
        }

        res.json({ message: 'Done Syncing Calendar Events'});

    } catch (error) {
        console.error('Error syncing Google Calendar events', error);
        res.status(500).json({ error: 'Failed to sync Google Calendar events' });
    }
})

router.post('/update-event', authenticateToken, async (req, res) => {
    const { eventId, updatedEventData } = req.body; // Assume these are passed from the frontend
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });

    if (!user || !user.accessToken || !user.refreshToken) {
        return res.status(401).send('Not authenticated with Google');
    }

    // Set up the OAuth2 client with the user's credentials
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.tokenExpiry.getTime(),
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        // Call the Google Calendar API to update the event
        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId, // the ID of the event to update
            requestBody: {
                summary: updatedEventData.title,
                description: updatedEventData.description,
                start: {
                    dateTime: updatedEventData.startAt,
                    timeZone: 'America/Los_Angeles' // TODO: Revisit whether to handle
                },
                end: {
                    dateTime: updatedEventData.endAt,
                    timeZone: 'America/Los_Angeles'
                },
                location: updatedEventData.location,
            },
        });

        const existingEvent = await prisma.calendarEvent.findFirst({
            where: { masterEventId: eventId }
        });

        if (existingEvent) {
            const updatedEvent = await prisma.calendarEvent.update({
                where: { id: existingEvent.id },
                data: {
                    title: updatedEventData.title,
                    startAt: updatedEventData.startAt,
                    endAt: updatedEventData.endAt,
                    description: updatedEventData.description,
                    location: updatedEventData.location,
                    allDay: updatedEventData.allDay,
                }
            });
        }

        res.json({ message: 'Event updated successfully', event: response.data });
    } catch (error) {
        console.error('Failed to update Google Calendar event', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

module.exports  = router;

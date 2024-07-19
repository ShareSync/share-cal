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
router.get('/sync-google-calendar', authenticateToken, async (req, res) => {
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
            // TODO: to implement masterEventId from change in Prisma Schema in a future commit
        }));
        await prisma.calendarEvent.createMany({ data: parsedEvents});
        res.json({ message: 'Done Syncing Calendar Events'});

    } catch (error) {
        console.error('Error syncing Google Calendar events', error);
        res.status(500).json({ error: 'Failed to sync Google Calendar events' });
    }
})

module.exports  = router;

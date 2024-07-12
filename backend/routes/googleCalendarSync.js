const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const { oauth2Client, SCOPES } = require('../middlewares/googleOAuthCOnfig');
const {google} = require('googleapis');

// Starts the OAuth flow
router.get('/google-calendar', authenticateToken, (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(url);
});

router.get('/google-calendar/callback', authenticateToken, async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store tokens in the User Table
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                accessToken:  tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiry: new Date(tokens.expiry_date),
            },
        });

        res.redirect('http://localhost:3000/google-cal/sync-google-calendar');
    } catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).send('Error retrieving access token');
    }
});

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
        const events = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const parsedEvents = events.data.items.map(event => ({
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            startAt: new Date(event.start.dateTime || event.start.date),
            endAt: new Date(event.end.dateTime || event.end.date),
            location: event.location || '',
            allDay: Boolean(!event.start.dateTime && !event.end.dateTime && event.start.date && event.end.date),
            userId: req.user.id,
        }));
        await prisma.calendarEvent.createMany({ data: parsedEvents});

        res.json({ message: 'Google Calendar events synced successfully'});
    } catch (error) {
        console.error('Error syncing Google Calendar events', error);
        res.status(500).json({ error: 'Failed to sync Google Calendar events' });
    }
})

module.exports  = router;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateTimeGrid() {
    const timeGrid = [];
    for (let i = 0; i < 48; i++) {
        timeGrid.push({ slot: i, available: true });
    }
    return timeGrid;
}

function markUnavailableSlots(timeGrid, startAt, endAt) {
    const startSlot = Math.floor(startAt.getHours() * 2 + startAt.getMinutes() / 30);
    const endSlot = Math.ceil(endAt.getHours() * 2 + endAt.getMinutes() / 30);
    for (let i = startSlot; i < endSlot; i++) {
        timeGrid[i].available = false;
    }
}

function findAvailableSlots(timeGrid, duration) {
    const availableSlots = [];
    let consecutiveSlots = 0;
    for (let i = 0; i < timeGrid.length; i++) {
        if (timeGrid[i].available) {
            consecutiveSlots++;
            if (consecutiveSlots >= duration) {
                availableSlots.push(i - duration + 1);
            }
        } else {
            consecutiveSlots = 0;
        }
    }
    return availableSlots;
}

async function recommendEventSlots(userId, duration, targetDate, invitees = []) {
    try {
        // Parse the date as UTC
        const parsedDate = new Date(targetDate + 'T00:00:00Z');
        const startOfDay = new Date(parsedDate);
        const endOfDay = new Date(parsedDate);

        // Set end of day in UTC
        endOfDay.setUTCHours(23, 59, 59, 999);


        const users = await prisma.user.findMany({
            where: {
                OR: [{ id: userId }, { email: { in: invitees } }]
            },
            include: {
                calendarEvents: {
                    where: {
                        status: 'accepted',
                        AND: [
                            { startAt: { lte: endOfDay } },
                            { endAt: { gte: startOfDay } }
                        ]
                    }
                }
            }
        });

        if (users.length === 0) {
            throw new Error('No users found');
        }

        let timeGrid = generateTimeGrid();
        users.forEach(user => {
            user.calendarEvents.forEach(event => {
                if (event.status === 'accepted') {
                    markUnavailableSlots(timeGrid, new Date(event.startAt), new Date(event.endAt));
                }
            });
            for (let i = 0; i < user.preferredStartTime; i++) {
                timeGrid[i].available = false;
            }
            for (let i = user.preferredEndTime; i < timeGrid.length; i++) {
                timeGrid[i].available = false;
            }
        });

        const availableSlots = findAvailableSlots(timeGrid, duration);
        if (availableSlots.length === 0) {
            return -1;
        }
        return availableSlots;
    } catch (error) {
        console.error('Error in recommendEventSlots:', error);
        throw error;
    }
}

module.exports = { recommendEventSlots };

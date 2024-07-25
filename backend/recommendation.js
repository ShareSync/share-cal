const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateTimeGrid() {
    const timeGrid = [];
    for (let i = 0; i < 48; i++) {
        timeGrid.push(true);
    }
    return timeGrid;
}

function markUnavailableSlots(timeGrid, startAt, endAt) {
    // For both startAt & endAt, the times are converted to numerical values to represent 30 mins interval time slots
    // Such that each hour is represented by 2 time slots, and every 30 minutes is represented by 1 time slot
    // Math.floor is used for startSlot to round down to the nearest slot.
    // Math.ceil is used for endSlot to round up to ensure coverage of the end time.
    const startSlot = Math.floor(startAt.getHours() * 2 + startAt.getMinutes() / 30);
    const endSlot = Math.ceil(endAt.getHours() * 2 + endAt.getMinutes() / 30);

    for (let i = startSlot; i < endSlot; i++) {
        timeGrid[i] = false;
    }
}

function findAvailableSlots(timeGrid, duration) {
    const availableSlots = [];
    let consecutiveSlots = 0;
    for (let i = 0; i < timeGrid.length; i++) {
        if (timeGrid[i]) {
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
                timeGrid[i] = false;
            }
            for (let i = user.preferredEndTime; i < timeGrid.length; i++) {
                timeGrid[i]= false;
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

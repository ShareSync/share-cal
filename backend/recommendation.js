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
        const parsedDate = new Date(targetDate);
        const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

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
            const userTimeGrid = generateTimeGrid();
            user.calendarEvents.forEach(event => {
                if (event.status === 'accepted') {
                    markUnavailableSlots(userTimeGrid, new Date(event.startAt), new Date(event.endAt));
                }
            });
            for (let i = 0; i < user.preferredStartTime; i++) {
                userTimeGrid[i].available = false;
            }
            for (let i = user.preferredEndTime; i < userTimeGrid.length; i++) {
                userTimeGrid[i].available = false;
            }
            timeGrid = timeGrid.map((slot, index) => ({ slot: index, available: slot.available && userTimeGrid[index].available }));
        });

        const availableSlots = findAvailableSlots(timeGrid, duration);
        if (availableSlots.length === 0) {
            throw new Error('No available slots found');
        }
        return availableSlots;
    } catch (error) {
        console.error('Error in recommendEventSlots:', error);
        throw error;
    }
}

module.exports = { recommendEventSlots };

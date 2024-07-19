import React from 'react';

const GoogleCalendarSync = () => {
    const handleSync = () => {
        window.location.href = `http://localhost:3000/google-cal/google-calendar`;
    };

    return (
        <div>
            <h2>Google Calendar Sync</h2>
            <button onClick={handleSync}>Sync with Google Calendar</button>
        </div>
    )
}

export default GoogleCalendarSync;

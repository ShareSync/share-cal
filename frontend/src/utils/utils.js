async function logout() {
    await fetch(`http://localhost:3000/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
}


function getDateString(date) {
    return date.toISOString().slice(0, 10);
}

function getReadableDateStr(dateTime) {
    return dateTime.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getTimeString(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getReadableTimeStr(dateTime) {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return `${hours % 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export {logout, getDateString, getTimeString, getReadableDateStr, getReadableTimeStr};

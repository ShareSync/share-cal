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

function getTimeString(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
export {logout, getDateString, getTimeString};

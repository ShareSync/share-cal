async function logout() {
    await fetch(`http://localhost:3000/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
}

export {logout};

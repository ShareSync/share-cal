import React from "react";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function GoogleOAuthCallback () {
    const navigate = useNavigate();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            fetch('http://localhost:3000/google-cal/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
                credentials: "include"
            })
            .then(response => response.json())
            .then(data => {
                // Handle response data, e.g., redirect to a dashboard
                syncGoogleCalendar();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }, [navigate]);

    const syncGoogleCalendar = () => {
        fetch('http://localhost:3000/google-cal/sync', {
            method: 'GET',
            credentials: 'include', // Ensure cookies are sent
        })
        .then(response => {
            if (response.ok) {
                // Redirect to the calendar view on successful sync
                navigate('/');
            } else {
                throw new Error('Failed to sync calendar');
            }
        })
        .catch(error => {
            console.error('Error syncing Google Calendar:', error);
        });
    };
    return (
        <div>
            <h1>Processing...</h1>
            <p>Please wait while we authenticate your account.</p>
        </div>
    )
}

export default GoogleOAuthCallback;

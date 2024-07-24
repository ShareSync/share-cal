import "./SharedEventsPage.css"
import { useState, useEffect } from "react";
import { fetchInvitations, respondToInvitation } from "../../utils/utils";
import Header from "../Header/Header"

function SharedEventsPage () {
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        fetchInvitations(setInvitations);
    }, []);

    const handleInvitationResponse = (eventId, status) => {
        respondToInvitation(eventId, status);
        setInvitations(invitations.filter(invite => invite.id !== eventId));
    }
    return (
        <div>
            <Header />
            <h2>Here are the events that have been shared with you</h2>
            <ul>
                {invitations.map(invite => (
                    <li key={invite.id}>
                        <p>{invite.title}</p>
                        <button onClick={() => handleInvitationResponse(invite.id, 'accepted')}>Accept</button>
                        <button onClick={() => handleInvitationResponse(invite.id, 'declined')}>Decline</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SharedEventsPage;

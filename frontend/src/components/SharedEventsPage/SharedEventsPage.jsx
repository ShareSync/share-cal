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
        <div className="shared-events-container">
            <Header />
            <div className="shared-events-content">
                <h2>Here are the events that have been shared with you</h2>
                <div className="scrollable">
                    <ul className="invitations-list">
                        {invitations.map(invite => (
                            <li key={invite.id} className="invitation-item">
                                <p className="event-title">{invite.title}</p>
                                <div className="invitation-buttons">
                                    <button className="accept-button" onClick={() => handleInvitationResponse(invite.id, 'accepted')}>Accept</button>
                                    <button className="decline-button" onClick={() => handleInvitationResponse(invite.id, 'declined')}>Decline</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SharedEventsPage;

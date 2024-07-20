import "./SharedEventsPage.css"
import { useState, useEffect } from "react";
import { fetchInvitations, respondToInvitation } from "../../utils/utils";

function SharedEventsPage () {
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        fetchInvitations(setInvitations);
    }, []);

    return (
        <div>
            <h2>Here are the events that have been shared with you</h2>
            <ul>
                {invitations.map(invite => (
                    <li key={invite.id}>
                        <p>{invite.title}</p>
                        <button onClick={() => respondToInvitation(invite.id, 'accepted', setInvitations, invitations)}>Accept</button>
                        <button onClick={() => respondToInvitation(invite.id, 'declined', setInvitations, invitations)}>Decline</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SharedEventsPage;

import "./EventDetail.css"

function EventDetail ({onClose}) {

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                    <button>Edit</button>
                    <button>Delete</button>
                    <h1>Event Title</h1>

                    <p>Event Description</p>

                    <p>Date</p>

                    {/* Conditionally won't show times for all day events */}
                    {<div className="date-time-container">
                        <div className="selector-obj">
                            <p>Start Time - End Time</p>
                        </div>
                    </div>}

                    <p> Event Location</p>

                    <p>Event Participants</p>
                    <button onClick={onClose}>Close</button>
            </div>
        </div>
    )
}

export default EventDetail;

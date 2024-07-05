import "./CreateEvent.css"
function CreateEvent () {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h1>Create a New Event</h1>
                <p>Event Title</p>
                <input type="text" placeholder="Event Title"/>
                <p>Event Description</p>
                <textarea name="description" id="notes" rows="5"></textarea>
                <div className="date-time-container">
                    <div className="selector-obj">
                        <p>Start Date</p>
                        <input type="date" />
                    </div>
                    <div className="selector-obj">
                        <p>Start Time</p>
                        <input type="time" />
                    </div>
                </div>
                <div className="date-time-container">
                    <div className="selector-obj">
                        <p>End Date</p>
                        <input type="date" />
                    </div>
                    <div className="selector-obj">
                        <p>End Time</p>
                        <input type="time" />
                    </div>
                </div>
                <p> Event Location</p>
                <input type="text" placeholder="Event Location" />
                <div id="all-day-section">
                    <p> All Day ?</p>
                    <input type="checkbox" placeholder="Event Location" />
                </div>
                <p> Event Participants</p>
                <input type="text" placeholder="" />
                <div id="form-button">
                    <button type="button">Cancel</button>
                    <button type="submit">Create Event</button>
                </div>

            </div>

        </div>
    )
}


export default CreateEvent;

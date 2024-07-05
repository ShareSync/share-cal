import "./CreateEvent.css"
import { useState } from "react";

function CreateEvent ({isOpen, onClose, onSubmit}) {
    const [title, setTitle]  = useState('');;
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [participants, setParticipants] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const eventData ={
            title: title,
            description: description,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            location: location,
            allDay: allDay,
            participants: participants
        };
        onSubmit(eventData);
    }

    const handleAllDayClicked = (e) => {
        setAllDay(e.target.checked);
        if (!allDay){
            setStartTime("00:00");
            setEndTime("23:59");
            setEndDate(startDate);
        }
    }
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h1>Create a New Event</h1>
                    <p>Event Title</p>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required/>
                    <p>Event Description</p>
                    <textarea name="description" id="notes" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}/>
                    <div className="date-time-container">
                        <div className="selector-obj">
                            <p>Start Date</p>
                            <input type="date" placeholder="mm/dd/yyyy" value={startDate} onChange={(e) => setStartDate(e.target.value)} required/>
                        </div>
                        {!allDay && <>
                            <div className="selector-obj">
                                <p>Start Time</p>
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required/>
                            </div>
                        </>}
                    </div>
                    <div className="date-time-container">
                        <div className="selector-obj">
                            <p>End Date</p>
                            <input type="date" placeholder="mm/dd/yyyy" value={endDate} onChange={(e) => setEndDate(e.target.value)} required/>
                        </div>
                        {!allDay && <>
                            <div className="selector-obj">
                                <p>End Time</p>
                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
                            </div>
                        </>}
                    </div>
                    <p> Event Location</p>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event Location" required/>
                    <div id="all-day-section">
                        <p> All Day ?</p>
                        <input type="checkbox" checked={allDay} onChange={(e) => handleAllDayClicked(e)} />
                    </div>
                    <p> Event Participants</p>
                    <input type="text" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Attendees"/>
                    <div id="form-button">
                        <button onClick={onClose} type="button">Cancel</button>
                        <button type="submit">Create Event</button>
                    </div>
                </form>
                </div>

        </div>
    )
}


export default CreateEvent;

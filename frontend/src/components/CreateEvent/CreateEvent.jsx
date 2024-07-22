import "./CreateEvent.css"
import { useState, useEffect } from "react";
import { slotToTime, getTomorrowsDate } from "../../utils/utils";

function CreateEvent ({onClose, onCreate, onEdit, initialView, isEdit}) {
    const [title, setTitle]  = useState('');;
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [participants, setParticipants] = useState('');
    const [duration, setDuration] = useState(1);
    const [recommendations, setRecommendations] = useState([]);

    const fetchRecommendations = async () => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'},
            body: JSON.stringify({
                duration,
                invitees: participants.split(',').map(email => email.trim()).filter(email => email !== ''),
                targetDate: getTomorrowsDate(date)
            }),
            credentials: 'include'
            };
        const response = await fetch(`${backendUrlAccess}/calendar/recommend-time-slots`, options);
        if (!response.ok) {
            throw new Error('Something went wrong!');
          }
        const data = await response.json();
        setRecommendations(data.recommendations);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        const startAt = new Date(`${date} ${startTime}`);
        const endAt = new Date(`${date} ${endTime}`)
        const eventData ={
            title: title,
            description: description,
            startAt: startAt,
            endAt: endAt,
            location: location,
            allDay: allDay,
            invitees: participants
            ? participants.split(',').map(email => email.trim()).filter(email => email !== '')
            : [],
            source: initialView.source,
            masterEventId: initialView.masterEventId
        };
        if (isEdit){
            onEdit(eventData, initialView.id);
        }
        else{
            onCreate(eventData);
        }
    }

    const handleAllDayClicked = (e) => {
        setAllDay(e.target.checked);
        if (!allDay){
            setStartTime("00:00");
            setEndTime("23:59");
        }
    }

    useEffect(() => {
        setTitle(initialView.title);
        setDate(initialView.date);
        setStartTime(initialView.start);
        setEndTime(initialView.end);
        setAllDay(initialView.allDay)
        setLocation(initialView.location);
        setDescription(initialView.description);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h1>Create a New Event</h1>

                    <p>Event Title</p>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required/>

                    <p>Event Description</p>
                    <textarea name="description" id="notes" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}/>

                    <p>Date</p>
                    <input type="date" placeholder="mm/dd/yyyy" value={date} onChange={(e) => setDate(e.target.value)} required/>

                    <p>Duration</p>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration in 30-min slots" min="1" />
                    <button type="button" onClick={fetchRecommendations}>Get Recommendations</button>
                    {recommendations.length > 0 && (
                        <div>
                            <h2>Recommended Times</h2>
                            <ul>
                            {recommendations.map((rec, index) => {
                                const startTime = slotToTime(rec);
                                const endTime = slotToTime(rec + duration);
                                return (
                                    <li key={index} onClick={() => {
                                        setStartTime(startTime);
                                        setEndTime(endTime);
                                    }}>{`Start: ${startTime}, End: ${endTime}`}</li>
                                );
            })}
                            </ul>
                        </div>
                    )}

                    <div id="all-day-section">
                        <p> All Day ?</p>
                        <input type="checkbox" checked={allDay} onChange={(e) => handleAllDayClicked(e)} />
                    </div>

                    {!allDay && <div className="date-time-container">
                        <div className="selector-obj">
                            <p>Start Time</p>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required/>
                        </div>
                        <div className="selector-obj">
                            <p>End Time</p>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
                        </div>
                    </div>}

                    <p> Event Location</p>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event Location"/>

                    {!isEdit && <>
                    <p>Event Participants</p>
                    <input type="text" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Attendees"/>
                    </>}

                    <div id="form-button">
                        <button onClick={onClose} type="button">Cancel</button>
                        <button type="submit">{isEdit ? "Save Changes" : "Create Event"}</button>
                    </div>
                </form>
                </div>

        </div>
    )
}


export default CreateEvent;

import "./CreateEvent.css"
import { useState, useEffect } from "react";
import { slotToTime, fetchRecommendations} from "../../utils/utils";

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
            <div className="modal-content-ce">
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
                    <button type="button" onClick={() => fetchRecommendations(setRecommendations, duration, participants, date)}>Get Recommendations</button>
                    {recommendations == -1 && (
                        <p>No available slots were found</p>
                    )}
                    <div className="recommended-times">
                        {recommendations.length > 0 && (
                            <div className="button-row">
                            {recommendations.map((rec, index) => {
                                const startTime = slotToTime(rec);
                                const endTime = slotToTime(rec + duration);
                                return (
                                    <button
                                    key={index}
                                    onClick={(e) => {
                                        setStartTime(startTime);
                                        setEndTime(endTime);
                                        e.preventDefault();
                                    }}
                                    >
                                    {`Start: ${startTime}, End: ${endTime}`}
                                    </button>
                                );
                            })}
                            </div>
                        )}
                    </div>

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

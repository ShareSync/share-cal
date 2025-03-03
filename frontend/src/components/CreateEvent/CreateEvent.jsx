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
        if (startTime >= endTime){
            alert('Invalid time entered');
            return;
        } else {

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

        if (initialView.start && initialView.end) {
            const start = new Date(`${initialView.date} ${initialView.start}`);
            const end = new Date(`${initialView.date} ${initialView.end}`);
            const durationInMinutes = (end - start) / 60000; setDuration(durationInMinutes / 30);
            setDuration(durationInMinutes / 30);
        }
    }, [initialView]);

    useEffect(() => {
        if (startTime) {
            const start = new Date(`${date} ${startTime}`);
            const newEnd = new Date(start.getTime() + duration * 30 * 60000);
            setEndTime(newEnd.toTimeString().slice(0, 5));
        }
    }, [duration])
    return (
        <div className="modal-overlay">
            <div className="create-event-modal-content">
                <form onSubmit={handleSubmit}>
                    <h1>{isEdit ? "Editing Existing Event" : "Create a New Event"}</h1>
                    <div className="scrollable-content">
                        <p>Event Title</p>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required/>

                        <p>Event Description</p>
                        <textarea name="description" id="notes" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}/>

                        <p>Date</p>
                        <input type="date" placeholder="mm/dd/yyyy" value={date} onChange={(e) => setDate(e.target.value)} required/>

                        {!allDay && (<>
                        <div className="date-time-container">
                            <div className="selector-obj">
                                <p>Start Time</p>
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required/>
                            </div>
                            <div className="selector-obj">
                                <p>End Time</p>
                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required/>
                            </div>
                        </div>

                        <p>Duration</p>
                        <input
                            type="range"
                            min="1"
                            max="48"
                            step='1'
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                        <p>Selected Duration: {Math.floor(duration / 2)} hour(s) {duration % 2 * 30} minute(s)</p>
                        <div className="recommendation-button">
                            <button type="button" onClick={() => fetchRecommendations(setRecommendations, duration, participants, date)}>Get Recommendations</button>
                            {recommendations.length > 0 && <button onClick={(e) => {setRecommendations([]); e.preventDefault();}}>Reset</button>}
                        </div>

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
                                        <p>{`Start: ${startTime}`}</p>
                                        <p>{`End: ${endTime}`}</p>
                                        </button>
                                    );
                                })}
                                </div>
                            )}
                        </div>
                    </>)}


                        <div id="all-day-section">
                            <p> All Day ?</p>
                            <input type="checkbox" checked={allDay} onChange={(e) => handleAllDayClicked(e)} />
                        </div>



                        <p> Event Location</p>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event Location"/>

                        {!isEdit && <>
                        <p>Event Participants (Comma-separated email addresses)</p>
                        <input type="text" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Attendees"/>
                        </>}
                    </div>

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

import "./EventDetail.css"
import { getReadableDateStr, getReadableTimeStr } from "../../utils/utils";
function EventDetail ({onClose, content, refetchEvents, handleEdit}) {

    const handleEventDelete = async () => {
        try{
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const options = {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'},
            credentials: 'include'
              };
            const response = await fetch(`${backendUrlAccess}/calendar/events/${content.id}`,options);
            if (!response.ok) {
              throw new Error('Something went wrong!');
            }
            refetchEvents();
            onClose();
          }
          catch(error) {
            console.error(error);
          }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={() => handleEventDelete()}>Delete</button>
                    <h1>{content.title}</h1>

                    <p>{getReadableDateStr(content.start)}</p>

                    {!content.allDay && <p>{getReadableTimeStr(content.start)} - {getReadableTimeStr(content.end)}</p>}
                    <p>Event Description: <br /> {content.description}</p>

                    <p>Location: {content.location}</p>

                    <p>Event Participants</p>
                    <button onClick={onClose}>Close</button>
            </div>
        </div>
    )
}

export default EventDetail;

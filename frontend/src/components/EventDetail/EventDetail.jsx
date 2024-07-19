import "./EventDetail.css"
import { handleEventDelete, getReadableDateStr, getReadableTimeStr } from "../../utils/utils";
function EventDetail ({onClose, content, refetchEvents, handleEdit}) {

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={() => handleEventDelete(content, onClose, refetchEvents)}>Delete</button>
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

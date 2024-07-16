import "./EventDetail.css"
import { getReadableDateStr, getReadableTimeStr } from "../../utils/utils";
function EventDetail ({onClose, content}) {

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                    <button>Edit</button>
                    <button>Delete</button>
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

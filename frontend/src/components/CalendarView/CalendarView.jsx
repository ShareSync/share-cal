import "./CalendarView.css"
import Header from "../Header/Header"
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";

function CalendarView () {
    const userInfo = useContext(UserContext).user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);

    const handleEventSubmit = (eventData) => {
        setEvents([...events, eventData]);
        setIsModalOpen(false);
    }
    useEffect(() => {

      }, [events]);
    return (
            <>
                <Header />
                <button onClick={() => setIsModalOpen(true)}>New Event</button>
                <p>This is the Calendar View Page</p>
                <p>Welcome {userInfo.firstName}</p>
                {isModalOpen && <CreateEvent
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleEventSubmit}
                />}
            </>
    )
}


export default  CalendarView;

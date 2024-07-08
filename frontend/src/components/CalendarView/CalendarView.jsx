import "./CalendarView.css"
import Header from "../Header/Header"
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";

function CalendarView () {
    const userInfo = useContext(UserContext).user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const { updateUser } = useContext(UserContext);

    const handleEventSubmit = (eventData) => {
        setEvents([...events, eventData]);
        setIsModalOpen(false);
    }

    const fetchCurrentUser = async () => {
        try {
          const response = await fetch('http://localhost:3000/auth/current', { credentials: 'include' });
          const data = await response.json();
          updateUser(data.user);
        } catch (error) {
          console.error('Failed to fetch current user', error);
          if (error.response && error.response.status === 401 ) {
            updateUser(null);
          }
        }
      };

    useEffect(() => {
        fetchCurrentUser();
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

import "./CalendarView.css"
import Header from "../Header/Header"
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";
import ICSUpload from "../ICSUpload/ICSUpload.jsx";

function CalendarView () {
    const userInfo = useContext(UserContext).user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const { updateUser } = useContext(UserContext);

    const createCalendarEvent = async (calendarEvent) => {
      try {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const options = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
          body: JSON.stringify(calendarEvent),
          credentials: 'include'
          }
        const response = await fetch(`${backendUrlAccess}/calendar/user/${userInfo.id}/events`, options);
        if (!response.ok) {
          throw new Error('Something went wrong!');
        }
        fetchCurrentUser();
      } catch (error) {
        console.error('Failed to create new calendar event: ', error);
        if (error.response && error.response.status === 401 ) {
          updateUser(null);
        }
        throw error;
      }
    };


    const handleEventSubmit = (eventData) => {
        createCalendarEvent(eventData);
        setIsModalOpen(false);
    }

    const fetchCurrentUser = async () => {
        try {
          const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
          const response = await fetch(`${backendUrlAccess}/auth/current`, { credentials: 'include' });
          const data = await response.json();
          updateUser(data.user);
          setEvents(data.user.calendarEvents);
        } catch (error) {
          console.error('Failed to fetch current user', error);
          if (error.response && error.response.status === 401 ) {
            updateUser(null);
          }
        }
      };

    useEffect(() => {
        fetchCurrentUser();
      }, []);

    const eventList = events.map((calEvent) => {
      return (
        <>
          <hr />
          <p>Title: {calEvent.title}</p>
          <p>Description: {calEvent.description}</p>
          <p>Start Time: {calEvent.startAt}</p>
          <p>End Time: {calEvent.endAt}</p>
          <p>Location: {calEvent.location}</p>
        </>
      )
    });

    const handleParsedEvents = (parsedEvents) => {
      parsedEvents.forEach(event => {
        createCalendarEvent(event);
      })
    }

    return (
            <>
                <Header />
                <button onClick={() => setIsModalOpen(true)}>New Event</button>
                <ICSUpload onEventsImported={handleParsedEvents}/>
                <p>This is the Calendar View Page</p>
                <p>Welcome {userInfo.firstName}</p>
                <p>Here are the events on your calendar:</p>
                {eventList}
                {isModalOpen && <CreateEvent
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleEventSubmit}
                />}
            </>
    )
}


export default CalendarView;

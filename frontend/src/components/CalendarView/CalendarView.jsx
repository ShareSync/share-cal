import "./CalendarView.css"
import Header from "../Header/Header"
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";
import ICSUpload from "../ICSUpload/ICSUpload.jsx";
import GoogleCalendarSync from "../GoogleCalendarSync/GoogleCalendarSync.jsx";

//Importing FullCalendar Library
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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

          if (response.status === 401) {
            updateUser(null);
            return;
          }

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
                <GoogleCalendarSync />
                <p>This is the Calendar View Page</p>
                <p>Welcome {userInfo.firstName}</p>
                {isModalOpen && <CreateEvent
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleEventSubmit}
                />}
                <div id="calendar-view">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events.map(event => ({
                      title: event.title,
                      start: event.startAt,
                      end: event.endAt
                    }))}
                    headerToolbar={{
                      left:'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    editable={true}
                    selectable={true}
                  />
                </div>
            </>
    )
}


export default CalendarView;

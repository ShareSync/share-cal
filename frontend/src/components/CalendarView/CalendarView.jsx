import "./CalendarView.css"
import Header from "../Header/Header"
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";
import ICSUpload from "../ICSUpload/ICSUpload.jsx";
import GoogleCalendarSync from "../GoogleCalendarSync/GoogleCalendarSync.jsx";

// Importing helper functions
import { getDateString, getTimeString } from "../../utils/utils.js";

//Importing FullCalendar Library
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function CalendarView () {
    const userInfo = useContext(UserContext).user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [initialView, setInitialView] = useState({
      date: "",
      start: "",
      end: "",
      allDay: false
    })
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

    const handleParsedEvents = (parsedEvents) => {
      parsedEvents.forEach(event => {
        createCalendarEvent(event);
      })
    }

    const handleDateSelect = (info) => {
      setInitialView({
        date: getDateString(info.start),
        start: getTimeString(info.start),
        end: getTimeString(info.end),
        allDay: info.allDay
      })
      setIsModalOpen(true);
    }

    const handleEventSelect = (info) => {
      // Triggered by eventClick for FullCalendar library
    }
    return (
            <>
                <Header />
                <div id="event-src">
                  <button onClick={() => setIsModalOpen(true)}>New Event</button>
                  <ICSUpload onEventsImported={handleParsedEvents}/>
                  <GoogleCalendarSync />
                </div>
                <p>Welcome {userInfo.firstName}</p>
                {isModalOpen && <CreateEvent
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleEventSubmit}
                    initialView={initialView}
                />}
                <div id="calendar-view">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={events.map(event => ({
                      title: event.title,
                      start: event.startAt,
                      end: event.endAt,
                      allDay: event.allDay
                    }))}
                    headerToolbar={{
                      left:'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    editable={true}
                    selectable={true}
                    select={handleDateSelect}
                  />
                </div>
            </>
    )
}


export default CalendarView;

import "./CalendarView.css"
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";

// Importing External Components
import Header from "../Header/Header"
import ICSUpload from "../ICSUpload/ICSUpload.jsx";
import GoogleCalendarSync from "../GoogleCalendarSync/GoogleCalendarSync.jsx";
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import EventDetail from "../EventDetail/EventDetail.jsx";

// Importing helper functions
import { createCalendarEvent, getDateString, getTimeString } from "../../utils/utils.js";

//Importing FullCalendar Library
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function CalendarView () {

    // UseContext Definition
    const userInfo = useContext(UserContext).user;
    const { updateUser } = useContext(UserContext);

    // State Variables
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [events, setEvents] = useState([]);

    // Handles View of the Event Creation/Editing Modal
    const [initialView, setInitialView] = useState({
      id: "",
      title: "",
      date: "",
      start: "",
      end: "",
      description: "",
      location: "",
      allDay: false
    });

    // Handles View of the Event Detail Modal
    const [detailView, setDetailView] = useState({
      title: "",
      start: "",
      end: "",
      allDay: false
    });

    // Handles Event Creation
    const handleEventSubmit = async (eventData) => {
        try{
          await createCalendarEvent(eventData, userInfo.id, fetchCurrentUser, updateUser);
          setIsModalOpen(false);
        } catch (error) {
          alert(error.message);
        }
    }

    // Handles Parsed Events from uploaded .ics file
    const handleParsedEvents = (parsedEvents) => {
      parsedEvents.forEach(event => {
        createCalendarEvent(event, userInfo.id, fetchCurrentUser, updateUser);
      })
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


    const handleDateSelect = (info) => {
      setIsEdit(false);
      setInitialView({
        date: getDateString(info.start),
        start: getTimeString(info.start),
        end: getTimeString(info.end),
        allDay: info.allDay
      })
      setIsModalOpen(true);
    }

    const handleEventSelect = (info) => {
      setDetailView({
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        allDay: info.event.allDay,
        location: info.event.extendedProps.location,
        description: info.event.extendedProps.description,
        status: info.event.extendedProps.status,
        source: info.event.extendedProps.source,
        masterEventId: info.event.extendedProps.masterEventId
      })
      setIsDetailModalOpen(true);
    }

    // Handles Drag & Drop, Resize actions with FullCalendarUI
    const handleEventEdit = async (info) => {
      try {
        const updatedEvent = {
          title: info.event.title,
          startAt: info.event.startStr,
          endAt: info.event.endStr,
          description: info.event.extendedProps.description,
          location: info.event.extendedProps.location,
          allDay: info.event.allDay
        }
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;

        // Handles for Editing Google Calendar Events
        if (info.event.extendedProps.source === 'google'){
          const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'},
            body: JSON.stringify({updatedEventData: updatedEvent}),
            credentials: 'include'
              };
          const response = await fetch(`${backendUrlAccess}/google-cal/update-event/${info.event.extendedProps.masterEventId}`, options);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }
        } else { // Handles Editing for Other Event Types (Personal, ICS)
          const options = {
          method: 'PUT',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'},
          body: JSON.stringify(updatedEvent),
          credentials: 'include'
            };
          const response = await fetch(`${backendUrlAccess}/calendar/events/${info.event.id}`, options);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }
        }

        fetchCurrentUser();
      } catch (error) {
        console.error('Failed to update calendar event: ', error);
        if (error.response && error.response.status === 401 ) {
          updateUser(null);
        }
        throw error;
      }
    }

    const handleEventEditButton = async (info, id) => {
      try {
        const updatedEvent = {
          title: info.title,
          startAt: info.startAt.toISOString(),
          endAt: info.endAt.toISOString(),
          description: info.description,
          location: info.location,
          allDay: info.allDay
        }
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        if (info.source === 'google'){ // Makes API Call for Google events
          const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'},
            body: JSON.stringify({updatedEventData: updatedEvent}),
            credentials: 'include'
              };
          const response = await fetch(`${backendUrlAccess}/google-cal/update-event/${info.masterEventId}`, options);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }
        } else { //Makes API Call for non-Google events
          const options = {
          method: 'PUT',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'},
          body: JSON.stringify(updatedEvent),
          credentials: 'include'
            };
          const response = await fetch(`${backendUrlAccess}/calendar/events/${id}`, options);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }
        }

        fetchCurrentUser();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update calendar event: ', error);
        if (error.response && error.response.status === 401 ) {
          updateUser(null);
        }
        throw error;
      }
    }

    const handleEdit = (info) => {
      setIsDetailModalOpen(false);
      setIsEdit(true);
      const editInfo = {
        id: info.id,
        title: info.title,
        date: getDateString(info.start),
        start: getTimeString(info.start),
        end: info.allDay ? getTimeString(info.start) : getTimeString(info.end),
        allDay: info.allDay,
        description: info.description,
        location: info.location,
        source: info.source,
        masterEventId: info.masterEventId,
      }
      setInitialView(editInfo);
      setIsModalOpen(true);
    }

    const newEventButton = () => {
      setInitialView({
        title: "",
        date: "",
        start: "",
        end: "",
        allDay: false,
        description: "",
        location: ""
      })
      setIsModalOpen(true);
      setIsEdit(false);
    }
    return (
            <>
                <Header />
                <div id="event-src">
                  <button onClick={newEventButton}>New Event</button>
                  <ICSUpload onEventsImported={handleParsedEvents}/>
                  <GoogleCalendarSync />
                </div>
                <p>Welcome {userInfo.firstName}</p>
                {isModalOpen && <CreateEvent
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleEventSubmit}
                    onEdit={handleEventEditButton}
                    initialView={initialView}
                    isEdit={isEdit}
                />}
                <div id="calendar-view">
                  <FullCalendar
                    height={"70vh"}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={events.map(event => ({
                      id: event.id,
                      title: event.title,
                      start: event.startAt,
                      end: event.endAt,
                      allDay: event.allDay,
                      extendedProps: {
                        description: event.description,
                        location: event.location,
                        status: event.status,
                        masterEventId: event.masterEventId,
                        source: event.source
                      },
                    }))}
                    headerToolbar={{
                      left:'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    editable={true}
                    selectable={true}
                    select={handleDateSelect}
                    eventClick={handleEventSelect}
                    eventChange={handleEventEdit}
                  />
                </div>
                {isDetailModalOpen && <EventDetail
                  onClose={() => setIsDetailModalOpen(false)}
                  content={detailView}
                  handleEdit={() => handleEdit(detailView)}
                  refetchEvents={fetchCurrentUser}
                 />}
            </>
    )
}


export default CalendarView;

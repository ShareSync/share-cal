import "./CalendarView.css"
import { UserContext } from '../../UserContext.js';
import { useState, useContext, useEffect } from "react";

// Importing External Components
import Header from "../Header/Header"
import ICSUpload from "../ICSUpload/ICSUpload.jsx";
import GoogleCalendarSync from "../GoogleCalendarSync/GoogleCalendarSync.jsx";
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import EventDetail from "../EventDetail/EventDetail.jsx";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Importing helper functions
import { fetchCurrentUser, createCalendarEvent, handleEventEdit, getDateString, getTimeString } from "../../utils/utils.js";

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
    const [isLoading, setIsLoading] = useState(false);

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
      eventData.source = 'personal';
        try{
          await createCalendarEvent(eventData, userInfo.id, () => fetchCurrentUser(setIsLoading, updateUser, setEvents), updateUser);
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
      fetchCurrentUser(setIsLoading, updateUser, setEvents);
    }

    // Handles When Date on Calendar is clicked
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

    // Handles Opening of Edit Event Modal
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

    // Handles when New Event is Clicked
    const handleNewEventClick = () => {
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

    // Triggers Detailed View to show
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

    useEffect(() => {
        fetchCurrentUser(setIsLoading, updateUser, setEvents);
      }, []);

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

        fetchCurrentUser(setIsLoading, updateUser, setEvents);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update calendar event: ', error);
        if (error.response && error.response.status === 401 ) {
          updateUser(null);
        }
        throw error;
      }
    }

    const handleEventMouseEnter = (info) => {
      tippy(info.el, {
        content: info.event.title,
        placement: 'top'
      })
    }

    return (
            <>
                <Header />
                <div id="event-src">
                  <button onClick={handleNewEventClick}>New Event</button>
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
                {isLoading && <div className="loading-bar"></div>}
                <div id="calendar-view">
                  <FullCalendar
                    height={"70vh"}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    nowIndicator='true'
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
                      backgroundColor: event.status === 'pending' ? '#5ea0e0' : '#36aad8'
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
                    eventChange={(info) => handleEventEdit(info, updateUser)}
                    eventMouseEnter={handleEventMouseEnter}
                  />
                </div>
                {isDetailModalOpen && <EventDetail
                  onClose={() => setIsDetailModalOpen(false)}
                  content={detailView}
                  handleEdit={() => handleEdit(detailView)}
                  refetchEvents={() => fetchCurrentUser(setIsLoading, updateUser, setEvents)}
                 />}
            </>
    )
}

export default CalendarView;

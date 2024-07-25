const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;

// API Integrations for User Authentication
// API Call for Handling User Registration
async function handleSignUp(userObj, updateUser, navigate, setFirstName, setLastName, setEmail, setPassword) {
    try {
        const response = await fetch(`${backendUrlAccess}/auth/registration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userObj),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();

          // Reset form fields
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');

          // Update the user context
          updateUser(data.user);

          // Navigate to the home page after successful login
          navigate('/');
        } else {
          // Handle signup failure case
          alert('Signup failed');
        }
    } catch (error) {
        // Handle any network or API request errors
        alert('Signup failed: ' + error);
    }
}

// API Call for Handling User Login
async function handleLogin(userObj, updateUser, navigate) {
    try {
        const response = await fetch(`${backendUrlAccess}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userObj),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        const { user } = data;

        updateUser(user);
        navigate('/');
    } catch (error) {
        console.error('Error logging in:', error.message);
        alert("Unsuccessful login attempt. Try again.");
    }
}

// API Call for Handling User Logout
async function handleOnLogout(updateUser, navigate) {
    try{
        await fetch(`http://localhost:3000/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        updateUser(null);
        navigate('/');
    } catch (error) {
        alert('Error logging out:', error.message);
    }
}

// API Call for Fetching Current User
async function fetchCurrentUser(setIsLoading, updateUser, setEvents) {
  try {
    setIsLoading(true);
    const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
    const response = await fetch(`${backendUrlAccess}/auth/current`, { credentials: 'include' });

    if (response.status === 401) {
      updateUser(null);
      setIsLoading(false);
      return;
    }

    const data = await response.json();
    updateUser(data.user);
    setEvents(data.user.calendarEvents);
    setIsLoading(false);
  } catch (error) {
    console.error('Failed to fetch current user', error);
    if (error.response && error.response.status === 401 ) {
      updateUser(null);
    }
    setIsLoading(false);
  }
}

// API Integrations for Calendar Management
// API Call for Creating a Calendar Event
const createCalendarEvent = async (calendarEvent, userId, fetchCurrentUser, updateUser) => {
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
      const response = await fetch(`${backendUrlAccess}/calendar/${userId}/events`, options);
      if (!response.ok) {
        const errorData = await response.json(); // Parse JSON to get the error message
        throw new Error(errorData.error || 'Something went wrong!');
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

// API Call for Deleting a Calendar Event
async function handleEventDelete(content, onClose, refetchEvents) {
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

// API Call for Editing Events via Drag/Drop
async function handleEventEdit(info, updateUser) {
  try {
    const updatedEvent = {
      title: info.event.title,
      startAt: info.event.startStr,
      endAt: info.event.endStr,
      description: info.event.extendedProps.description,
      location: info.event.extendedProps.location,
      allDay: info.event.allDay
    }

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

  } catch (error) {
    console.error('Failed to update calendar event: ', error);
    if (error.response && error.response.status === 401 ) {
      updateUser(null);
    }
    throw error;
  }
}

// TODO: API Call for Editing Events via Manual Data Entry

// API Call for Uploading a .ics File for Parsing
async function handleICSParsing(formData, onEventsImported) {
    try{
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const options = {
            method: 'POST',
            body: formData,
            credentials: 'include'
        }
        const response = await fetch(`${backendUrlAccess}/calendar/import-ics`, options);
        const data = await response.json();
        if(response.ok) {
            onEventsImported(data);
            alert('Events imported successfully!');
        } else {
            alert(`Failed to import events: ${data.error}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
    }
}

// Related to Shared Events
// API Call for Fetching Event Invitations
async function fetchInvitations(setInvitations) {
  try {
      const response = await fetch(`${backendUrlAccess}/calendar/invitations`, { credentials: 'include' });
      const data = await response.json();
      setInvitations(data);
  } catch (error) {
    console.error('Error fetching invitations:', error);
  }
}

// API Call for Responding to Event Invitations
async function respondToInvitation(eventId, status){
  try {
    const inviteResponse = {
      status
    }
    const options = {
      method: 'PATCH',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'},
      body: JSON.stringify(inviteResponse),
      credentials: 'include'
        };
    const response = await fetch(`${backendUrlAccess}/calendar/events/${eventId}/respond`, options);
    const data = await response.json();
  } catch (error) {
    console.error('Error responding to invitation:', error);
  }
}

async function fetchRecommendations(setRecommendations, duration, participants, date) {
  const options = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'},
    body: JSON.stringify({
        duration,
        invitees: participants.split(',').map(email => email.trim()).filter(email => email !== ''),
        targetDate: date
    }),
    credentials: 'include'
  };
  const response = await fetch(`${backendUrlAccess}/calendar/recommend-time-slots`, options);
  if (!response.ok) {
      throw new Error('Something went wrong!');
    }
  const data = await response.json();
  setRecommendations(data.recommendations);
}

// Helper Functions
// Converts JS Date object (Provide example) into ISO String format (Provide example) -> Specifically extracts the date
function getDateString(date) {
    return date.toISOString().slice(0, 10);
}

// Converts JS DateTime object (provide exmaple) into readable date format (Thursday, July 18, 2024)
function getReadableDateStr(dateTime) {
    return dateTime.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Converts JS Date object (Provide example) into ISO String format (Provide example) -> Specifically extracts the time
function getTimeString(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Converts JS DateTime object (provide exmaple) into readable time format (9:00 AM)
// TODO: fix issue with 12th hour (either midnight or noon) not being shown properly
//       currently shows as 0:00 PM, 0:30 AM, etc.
function getReadableTimeStr(dateTime) {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const readableHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${readableHours % 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function slotToTime(slot) {
  const hours = Math.floor(slot / 2);
  const minutes = (slot % 2) * 30;
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

function getTomorrowsDate(currentDateString) {
  // Parse the current date string as a UTC date
  const currentDate = new Date(currentDateString + 'T00:00:00Z');
  // Add one day using UTC methods
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  // Format the date back to "YYYY-MM-DD" using UTC methods
  const year = currentDate.getUTCFullYear();
  const month = (currentDate.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() is zero-based
  const day = currentDate.getUTCDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
export {
    handleSignUp, handleLogin, handleOnLogout, fetchCurrentUser,
    handleICSParsing,
    createCalendarEvent, handleEventDelete, handleEventEdit,
    fetchInvitations, respondToInvitation,
    getDateString, getTimeString, getReadableDateStr, getReadableTimeStr, slotToTime, getTomorrowsDate,
    fetchRecommendations
};

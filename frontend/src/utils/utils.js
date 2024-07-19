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
async function handleOnLogout(updateUser) {
    try{
        await fetch(`http://localhost:3000/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        updateUser(null);
    } catch (error) {
        alert('Error logging out:', error.message);
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
      const response = await fetch(`${backendUrlAccess}/calendar/user/${userId}/events`, options);
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

export {
    handleSignUp, handleLogin, handleOnLogout,
    handleICSParsing,
    createCalendarEvent, handleEventDelete,
    getDateString, getTimeString, getReadableDateStr, getReadableTimeStr
};

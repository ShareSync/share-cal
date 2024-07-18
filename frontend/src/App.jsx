import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserContext } from './UserContext';

// Importing components to be used for page routing
import LoginPage from './components/LoginPage/LoginPage';
import SignUpPage from './components/SignUpPage/SignUpPage';
import CalenderView from './components/CalendarView/CalendarView';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import SharedEventsPage from './components/SharedEventsPage/SharedEventsPage';
import GoogleOAuthCallback from './components/GoogleOAuthCallback/GoogleOAuthCallback';

function App() {
  const [user, setUser] = useState(() => {
    // Retrieve the user data from storage or set it to null if not found
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/auth/current`, { credentials: 'include' });
        const data = await response.json();
        if (data.user) {
          updateUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser}}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <CalenderView />: <LoginPage />} />
          <Route path='/signup' element= {<SignUpPage />}/>
          <Route path='/user/:id/calendar' element={<CalenderView />}/>
          <Route path='/user/:id/shared-events' element={<SharedEventsPage />}/>
          <Route path='/google-calendar/callback' element={<GoogleOAuthCallback />} />
          <Route path='*' element={<NotFoundPage />}/>
        </Routes>
      </Router>
    </UserContext.Provider>
  )
}

export default App

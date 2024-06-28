import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import LoginPage from './components/LoginPage/LoginPage';
import SignUpPage from './components/SignUpPage/SignUpPage';
import CalenderView from './components/CalendarView/CalendarView';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import SharedEventsPage from './components/SharedEventsPage/SharedEventsPage';

// import { useNavigate } from 'react-router-dom';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/signup' element= {<SignUpPage />}/>
        <Route path='/user/:id/calendar' element={<CalenderView />}/>
        <Route path='/user/:id/shared-events' element={<SharedEventsPage />}/>
        <Route path='*' element={<NotFoundPage />}/>
      </Routes>
    </Router>
  )
}

export default App

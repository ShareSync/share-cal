import "./CalendarView.css"
import Header from "../Header/Header"
import CreateEvent from "../CreateEvent/CreateEvent.jsx";
import { UserContext } from '../../UserContext.js';
import { useState, useContext } from "react";

function CalendarView () {
    const userInfo = useContext(UserContext).user;
    return (
            <>
                <Header />
                <p>This is the Calendar View Page</p>
                <p>Welcome {userInfo.firstName}</p>
                <CreateEvent />
            </>
    )
}


export default  CalendarView;

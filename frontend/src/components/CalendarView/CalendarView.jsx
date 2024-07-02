import "./CalendarView.css"
import Header from "../Header/Header"
import { UserContext } from '../../UserContext.js';
import { useState, useContext } from "react";

function CalendarView () {
    const userInfo = useContext(UserContext).user;
    console.log({userInfo});
    return (
            <>
                <Header />
                <p>This is the Calendar View Page</p>
                <p>Welcome {userInfo.firstName}</p>
            </>
    )
}


export default  CalendarView;

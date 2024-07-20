import "./Header.css"
import { useState, useContext } from "react";
import { UserContext } from '../../UserContext.js';
import { handleOnLogout } from "../../utils/utils.js"
import { useNavigate } from 'react-router-dom';

function Header () {
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div id ="header">
            <img id="app-logo" src="/logo.jpg" alt="logo" />
            <h1>ShareCal</h1>
            <button onClick={() => navigate(`/shared-events`)}>Shared Events</button>
            <button onClick={() => handleOnLogout(updateUser)}>Log out</button>
        </div>
    )
}

export default Header;

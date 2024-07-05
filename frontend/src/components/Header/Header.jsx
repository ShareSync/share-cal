import "./Header.css"
import { useState, useContext } from "react";
import { UserContext } from '../../UserContext.js';
import { logout } from "../../utils/utils.js"

function Header () {
    const { updateUser } = useContext(UserContext);

    const handleOnLogout = async () => {
        try {
            logout();
            updateUser(null);
        } catch (error) {
            alert('Error logging out:', error.message);
        }
    }

    return (
        <div id ="header">
            <img id="app-logo" src="/logo.jpg" alt="logo" />
            <h1>ShareCal</h1>
            <button onClick={() => handleOnLogout()}>Log out</button>
        </div>
    )
}

export default Header;

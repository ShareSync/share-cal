import "./Header.css"
import { useState, useContext } from "react";
import { UserContext } from '../../UserContext.js';
import { handleOnLogout } from "../../utils/utils.js"

function Header () {
    const { updateUser } = useContext(UserContext);

    return (
        <div id ="header">
            <img id="app-logo" src="/logo.jpg" alt="logo" />
            <h1>ShareCal</h1>
            <button onClick={() => handleOnLogout(updateUser)}>Log out</button>
        </div>
    )
}

export default Header;

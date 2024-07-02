import "./Header.css"
import { useState, useContext } from "react";
import { UserContext } from '../../UserContext.js';

function Header () {
    const { updateUser } = useContext(UserContext);

    const handleOnLogout = async (event) => {
        try {
            await fetch(`http://localhost:3000/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            updateUser(null);
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    }

    return (
        <div id ="header">
            <img src="https://placehold.co/100x100" alt="logo" />
            <h1>ShareCal</h1>
            <button onClick={handleOnLogout}>Log out</button>
        </div>
    )
}

export default Header;

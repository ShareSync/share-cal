import "./Header.css"
import { useContext } from "react";
import { UserContext } from '../../UserContext.js';
import { handleOnLogout } from "../../utils/utils.js"
import { useNavigate } from 'react-router-dom';

function Header () {
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div id ="header">
            <div id='header-logo' onClick={() => navigate(`/`)}>
                <img id="app-logo" src="/favicon.jpg" alt="logo" />
                <h1>ShareCal</h1>
            </div>
            <button className='header-button' onClick={() => navigate(`/shared-events`)}>Shared Events</button>
            <button className='header-button' onClick={() => handleOnLogout(updateUser, navigate)}>Log out</button>
        </div>
    )
}

export default Header;

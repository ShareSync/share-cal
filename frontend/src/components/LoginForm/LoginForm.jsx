import "./LoginForm.css"
import { Link } from 'react-router-dom';
import { useState } from "react";


function LoginForm (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleOnSubmit (event) {
        event.preventDefault();
        event.stopPropagation();
        const userObj = {
            email: email,
            password: password
        }
        console.log("User Info: ", userObj);
    }

    return(
        <div id="login-form">
            <form>
                <h1>Login</h1>
                <p>Email Address</p>
                <input type="email" placeholder="johndoe@email.com" onChange={(e) => setEmail(e.target.value)} value={email}/>
                <p>Password</p>
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
                <button onClick={(e) => handleOnSubmit(e)}>Login</button>
                <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
            </form>
        </div>
    )
}

export default LoginForm;

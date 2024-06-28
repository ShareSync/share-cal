import { useState } from "react";
import "./SignUpForm.css"
import { Link } from 'react-router-dom';

function SignUpForm (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    function handleOnSubmit (event) {
        event.preventDefault();
        event.stopPropagation();
        const userObj = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        }
        console.log("User Info: ", userObj);
    }
    return(
        <div id="login-form">
            <form>
                <h1>Create New Account</h1>
                <p>First Name</p>
                <input type="input" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} value={firstName}/>
                <p>Last Name</p>
                <input type="input" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} value={lastName}/>
                <p>Email Address</p>
                <input type="email" placeholder="johndoe@email.com" onChange={(e) => setEmail(e.target.value)} value={email}/>
                <p>Password</p>
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
                <button onClick={(e) => handleOnSubmit(e)}>Sign Up</button>
                <p>Already have an account? <Link to='/'>Login Here</Link></p>
            </form>
        </div>
    )
}

export default SignUpForm;

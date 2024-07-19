import { useState, useContext } from "react";
import "./SignUpForm.css"
import { UserContext } from '../../UserContext.js';
import { useNavigate, Link} from 'react-router-dom';
import {validate as validateEmail} from 'email-validator';
import { handleSignUp } from "../../utils/utils.js";

function SignUpForm (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        if (firstName && lastName && email && password) {
          const isEmailValid = validateEmail(email);
          const isPasswordValid = (password.length >= 8);
          // Validate email and password
          if (!isEmailValid && !isPasswordValid){
            setEmailError("Invalid email address");
            setPasswordError("Password must be at least 8 characters long");
            return;
          }
            // Validate email
            if (!isEmailValid) {
              setEmailError("Invalid email address");
            } else {
              setEmailError(null);
            }
            // Validate password
            if (!isPasswordValid) {
              setPasswordError("Password must be at least 8 characters long");
            } else {
              setPasswordError(null);
            }
            if (!isEmailValid || !isPasswordValid){
              return;
            }
          const userObj = {
              firstName: firstName,
              lastName: lastName,
              email: email,
              password: password
          }

          handleSignUp(userObj, updateUser, navigate, setFirstName, setLastName, setEmail, setPassword);
      } else {
        alert("Please fill out all fields");
      }
    }
    return(
        <div id="login-form">
            <form>
                <h1>Create New Account</h1>
                <p>First Name</p>
                <input required type="input" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} value={firstName}/>
                <p>Last Name</p>
                <input required type="input" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} value={lastName}/>
                <p>Email Address</p>
                <input required type="email" placeholder="johndoe@email.com" onChange={(e) => setEmail(e.target.value)} value={email}/>
                {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                <p>Password</p>
                <input required type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
                {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
                <button onClick={(e) => handleOnSubmit(e)}>Sign Up</button>
                <p>Already have an account? <Link to='/'>Login Here</Link></p>
            </form>
        </div>
    )
}

export default SignUpForm;

import "./LoginForm.css"
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext.js';
import { useState, useContext } from "react";


function LoginForm (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate()


    const userObj = {
        email: "",
        password: ""
    }
    const handleOnSubmit = async (event)  => {
        event.preventDefault();
        if (email && password) {
          const userObj = {
            email: email,
            password: password
          };

          console.log(userObj);

          try {
            const response = await fetch('http://localhost:3000/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(userObj),
              credentials: 'include'
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const data = await response.json();
            const { user } = data;

            updateUser(user);
            navigate('/user/5/calendar');
            alert("Successfully Logged In");
          } catch (error) {
            console.error('Error logging in:', error.message);
            alert("Unsuccessful login attempt. Try again.");
          }
        } else {
          alert("Please fill out all fields");
        }
      };

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

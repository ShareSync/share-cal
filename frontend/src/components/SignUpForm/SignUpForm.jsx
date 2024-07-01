import { useState } from "react";
import "./SignUpForm.css"
import { UserContext } from '../../UserContext.js';
import { useNavigate, Link} from 'react-router-dom';

function SignUpForm (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleOnSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const userObj = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        }

        try {
          // Make the signup API request
          const response = await fetch(`http://localhost:3000/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userObj),
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            // const loggedInUser = data.user;

            console.log('Signup successful');

            // Reset form fields
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');

            // Update the user context
            // updateUser(loggedInUser);

            // Navigate to the home page after successful login
            navigate('/');
          } else {
            // Handle signup failure case
            alert('Signup failed');
          }
        } catch (error) {
          // Handle any network or API request errors
          alert('Signup failed: ' + error);
        }

        // console.log("User Info: ", userObj);
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

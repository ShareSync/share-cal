import "./LoginForm.css"
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext.js';
import { useState, useContext } from "react";
import { handleLogin } from "../../utils/utils.js";

function LoginForm (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate()

    const handleOnSubmit = async (event)  => {
        event.preventDefault();
        if (email && password) {
          const userObj = {
            email: email,
            password: password
          };
          handleLogin(userObj, updateUser, navigate);
        } else {
          alert("Please fill out all fields");
        }
      };

    return(
        <div id="login-form">
            <form>
                <h1>Login</h1>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required placeholder="johndoe@email.com" onChange={(e) => setEmail(e.target.value)} value={email}/>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" required onChange={(e) => setPassword(e.target.value)} value={password}/>
                </div>
                <button onClick={(e) => handleOnSubmit(e)}>Login</button>
                <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
            </form>
        </div>
    )
}

export default LoginForm;

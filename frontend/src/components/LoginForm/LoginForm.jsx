import "./LoginForm.css"
import { Link } from 'react-router-dom';


function LoginForm (){
    return(
        <div id="login-form">
            <form>
                <h1>Login</h1>
                <p>Email address</p>
                <input type="email" placeholder="johndoe@email.com" />
                <p>Password</p>
                <input type="password" />
                <button>Login</button>
                <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
            </form>
        </div>
    )
}

export default LoginForm;

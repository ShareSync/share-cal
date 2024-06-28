import "./SignUpForm.css"
import { Link } from 'react-router-dom';

function SignUpForm (){
    return(
        <div id="login-form">
            <form>
                <h1>Create New Account</h1>
                <p>First Name</p>
                <input type="input" placeholder="First Name" />
                <p>Last Name</p>
                <input type="input" placeholder="Last Name" />
                <p>Email address</p>
                <input type="email" placeholder="johndoe@email.com" />
                <p>Password</p>
                <input type="password" />
                <p>Confirm Password</p>
                <input type="password" />
                <button>Sign Up</button>
                <p>Already have an account? <Link to='/'>Login Here</Link></p>
            </form>
        </div>
    )
}

export default SignUpForm;

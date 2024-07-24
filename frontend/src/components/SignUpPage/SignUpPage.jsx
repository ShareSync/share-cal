import "./SignUpPage.css"
import SignUpForm from "../SignUpForm/SignUpForm"

function SignUpPage () {
    return (
        <div id="main-container">
            <SignUpForm />
            <div id='img-container'>
                <img src="/logo.jpg" alt="logo"/>
            </div>
        </div>
    )
}

export default SignUpPage;

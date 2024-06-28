import "./SignUpPage.css"
import SignUpForm from "../SignUpForm/SignUpForm"

function SignUpPage () {
    return (
        <div id="main-container">
                <SignUpForm />
                <div>
                    <img src="https://placehold.co/100x100" alt="logo"/>
                    <h1>ShareCal</h1>
                </div>
            </div>
    )
}

export default SignUpPage;

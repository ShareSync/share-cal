import "./LoginPage.css"
import LoginForm from "../LoginForm/LoginForm"

function LoginPage () {
    return (
        <>
            <div id="main-container">
                <LoginForm />
                <div>
                    <img src="https://placehold.co/100x100" alt="logo"/>
                    <h1>ShareCal</h1>
                </div>
            </div>

        </>
    )
}

export default LoginPage;

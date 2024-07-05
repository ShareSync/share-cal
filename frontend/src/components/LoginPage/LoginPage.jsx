import "./LoginPage.css"
import LoginForm from "../LoginForm/LoginForm"

function LoginPage () {
    return (
        <>
            <div id="main-container">
                <LoginForm />
                <div>
                    <img height="100px;" src="/logo.jpg" alt="logo"/>
                    <h1>ShareCal</h1>
                </div>
            </div>

        </>
    )
}

export default LoginPage;

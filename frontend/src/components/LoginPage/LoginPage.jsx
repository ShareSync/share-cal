import "./LoginPage.css"
import LoginForm from "../LoginForm/LoginForm"

function LoginPage () {
    return (
        <div className="login-page">
            <div className="main-container">
                <LoginForm />
                <div className="logo-container">
                    <img height="100px;" src="/favicon.jpg" alt="logo"/>
                    <h1>ShareCal</h1>
                </div>
            </div>

        </div>
    )
}

export default LoginPage;

import "./LoginForm.css"

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
            </form>
        </div>
    )
}

export default LoginForm;

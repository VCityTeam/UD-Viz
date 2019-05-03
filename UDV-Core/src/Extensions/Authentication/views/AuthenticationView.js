import './AuthenticationView.css';
import {dragElement} from "../../DocToValidate/views/Draggable";

/**
 * adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */
export function LoginRegistrationWindow(authenticationService, requestService) {

    this.requestService = requestService;
    this.authenticationService = authenticationService;

    this.initialize = function initialize() {
    };

     this.html = function () {
        return `
              <button id="loginRegistrationCloseButton">Close</button>\
            <form id="RegistrationForm">\
                <h2>Registration</h2> \
                <label for="Firstname">Firstname</label>\
                <input type="text" name="firstName" id="Firstname"/>\
                <label for="Lastname">Lastname</label>\
                <input type="text" name="lastName" id="Lastname"/>\
                <label for="Username">Username</label>\
                <input type="text" name="username" id="Username"/>\
                <label for="Email">Email</label>\
                <input type="text" name="email" id="Email"/>\
                <label for=PasswordRegistration>Password</label>\
                <input type="password" name="password" id="PasswordRegistration"/>\
                <!--<label for="ConfirmPasswordRegistration"> Confirm Password*</label>\
                <input type="password" name="confirmPassword" id="ConfirmPasswordRegistration"/>-->\
                <button type="button" name="register" id="RegisterButton">Register</button>\
                <p id="RegisterError" class="ErrorBox"></p>\
            </form>\
            \
            <form id="LoginForm">\
                <h2>Login</h2>\
                <label for="Login">Username</label>\
                <input type="text" id="login" name="username"/>\
                <label for=PasswordLogin>Password</label>\
                <input type="password" id="PasswordLogin" name="password"/>\
                <div>Forgot your password?</div>\
                <button type="button" id="LoginButton">Login</button>\
                <p id="LoginError" class="ErrorBox"></p>\
                <button type="button" id="TEST">TEST</button>\
            </form>\
        `;
    }

    this.appendToElement = function(htmlElement) {
        let div = document.createElement('div');
        div.innerHTML = this.html();
        div.id = "loginRegistrationWindow";
        htmlElement.appendChild(div);
        console.log('hello');
        document.getElementById('loginRegistrationCloseButton').onclick = () => { this.dispose() };
        console.log(document.getElementById('loginRegistrationCloseButton'));
        document.getElementById('LoginButton').onclick = this.logInFunction;
        document.getElementById('RegisterButton').onclick = this.registerFunction;

    }


    this.dispose = function(){
        let div = document.getElementById('loginRegistrationWindow');
        return div.parentNode.removeChild(div);
    }

    this.displayRegisterError = function (msg) {
        let errorField = document.getElementById('RegisterError');
        errorField.innerHTML = msg;
    };

    this.displayLoginError = function (msg) {
        let errorField = document.getElementById('LoginError');
        errorField.innerHTML = msg;
    };

    this.logInFunction = function () {
        document.getElementById('LoginButton').onclick = async () => {
            console.log('Login1');
            this.displayLoginError('');
            const loginForm = document.getElementById('LoginForm');
            const formData = new FormData(loginForm);
            try {
                await this.authenticationService.login(formData);
                this.authenticationService.notifyObservers();
            } catch (e) {
                this.displayLoginError(e);
            }
        };
    }

     this.registerFunction  = function () {
        document.getElementById('RegisterButton').onclick = async () => {
            this.displayRegisterError('');
            // const password = document.getElementById('PasswordRegistration').value;
            // const confirmPassword = document.getElementById('ConfirmPasswordRegistration').value;
            // if (password !== confirmPassword) {
            //     this.displayRegisterError('Passwords must be identical.');
            //     return;
            // }
            const registerForm = document.getElementById('RegistrationForm');
            const formData = new FormData(registerForm);
            try {
                await this.authenticationService.register(formData);
                this.authenticationService.notifyObservers();
            } catch (e) {
                this.displayRegisterError(e);
            }
        };
    };

    this.initialize();
}

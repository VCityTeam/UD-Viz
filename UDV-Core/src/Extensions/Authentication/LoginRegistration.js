import './LoginRegistration.css';

/**
 * adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */
export function LoginRegistrationWindow(authenticationController, options = {}) {

    this.authenticationController = authenticationController;

    this.initialize = function initialize() {
        // Create DOM element
        let loginRegistrationDiv = document.createElement("div");
        loginRegistrationDiv.id = 'loginRegistrationWindow';
        $("#contentSection").append(loginRegistrationDiv);

        // Create HMTL
        document.getElementById("loginRegistrationWindow").innerHTML =
            ' <button id="loginRegistrationCloseButton">Close</button>\
        \<fieldset class="RegistrationForm">\
             <legend align="left"> Registration: </legend> \
             <label for="Firstname" >Name *</label> <input type="text" id="Firstname"/><br>\
             <label for="Lastname" >Lastname *</label> <input type="text" id="Lastname"/><br>\
             <label for="Username">Username *</label>         <input type="text" id="Username"  /><br>\
             <label for="Email">Email *</label>         <input type="text" id="Email"  /><br>\
             <label for=PasswordRegistration> Password*</label> <input type="password" id="PasswordRegistration"  /><br>\
             <label for="ConfirmPasswordRegistration"> Confirm Password*</label> <input type="password" id="ConfirmPasswordRegistration" /><br> <br>\
             <div align="center"><button  id="Register"  >Register</button></div> \
             <p id="RegisterError" class="ErrorBox"></p>\
        </fieldset>\
        \
        <fieldset class="LoginForm">\
           <legend align="left"> Login: </legend>\
           <label for="Login"> Username * </label> <input type="text" id="login" name="login" /><br>\
           <label for=PasswordLogin>Password * </label> <input type="password" id="PasswordLogin" name="password"  /><br> <br>\
           <div align="center"><button id="LoginButton">Login</button></div>\
           <p id="LoginError" class="ErrorBox"></p>\
        </fieldset>\
        ';

        this.initializeForms();

        // Close the window...when close button is hit
        document.getElementById("loginRegistrationCloseButton").addEventListener(
            'mousedown', () => {
                let activate = document.getElementById('activateLoginRegistration');
                activate.checked = !activate.checked;
            }, false);
    }

    this.displayRegisterError = function (msg) {
        let errorField = document.getElementById('RegisterError');
        errorField.innerHTML = msg;
    }

    this.displayLoginError = function (msg) {
        let errorField = document.getElementById('LoginError');
        errorField.innerHTML = msg;
    }

    this.initializeForms = function () {
        document.getElementById('LoginButton').onclick = () => {
            const params = {
                login: document.getElementById('login').value,
                password: document.getElementById('PasswordLogin').value
            };
            this.authenticationController.login(params);
        };

        document.getElementById('Register').onclick = () => {
            const password = document.getElementById('PasswordRegistration').value;
            const confirmPassword = document.getElementById('ConfirmPasswordRegistration').value;
            if (password !== confirmPassword) {
                this.displayRegisterError('Passwords must be identical.');
                return;
            }
            const params = {
                firstname: document.getElementById('Firstname').value,
                lastname: document.getElementById('Lastname').value,
                username: document.getElementById('Username').value,
                email: document.getElementById('Email').value,
                password: password
            };
            this.authenticationController.register(params);
        };
    }

    this.initialize();
}

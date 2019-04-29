import './LoginRegistration.css';

/**
 * adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */
export function LoginRegistrationWindow(options = {}) {

    // Create DOM element
    let loginRegistrationDiv = document.createElement("div");
    loginRegistrationDiv.id = 'loginRegistrationWindow';
    $("#contentSection").append(loginRegistrationDiv);

    // Create HMTL
    document.getElementById("loginRegistrationWindow").innerHTML =
        ' <button id="loginRegistrationCloseButton">Close</button>\
        \<fieldset class="RegistrationForm">\
         <legend align="left"> Registration: </legend> \
         <label for="Nom" >Name*</label> <input type="text" id="Nom"/><br>\
         <label for="Surname">Surname*</label>         <input type="text" id="Surname"  /><br>\
         <label for=PasswordRegistration> Password*</label> <input type="password" id="PasswordRegistration"  /><br>\
         <label for="ConfirmPasswordRegistration"> Confirm Password*</label> <input type="password" id="ConfirmPasswordRegistration" /><br> <br>\
         <div align="center"><button  id="Register"  >Register</button></div> \
        </fieldset>\
        \
        <fieldset class="LoginForm">\
        <legend align="left"> Login: </legend>\
        <div align="center">\
            <input type="text" id="login" name="login" placeholder="mail" /><br>\
            <input type="password" id="PasswordLogin" name="password" placeholder="password" /><br> <br>\
            <button id="LoginButton">Login</button>\
        <div id="message"></div>\
            </div>\
            </fieldset>\
        ';

    // Close the window...when close button is hit
    document.getElementById("loginRegistrationCloseButton").addEventListener(
        'mousedown', () => {
        let activate = document.getElementById('activateLoginRegistration');
    activate.checked = !activate.checked;
}, false);
}

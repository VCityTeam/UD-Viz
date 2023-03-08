import { findChildByID } from '../../../../HTMLUtil';

import './AuthenticationView.css';

/**
 *  It's a view that displays a login and registration form
 *
 * @class
 */
export class AuthenticationView {
  /**
   *
   * @param {Function} authenticationService Authentication service
   */
  constructor(authenticationService) {
    /** It's a constructor that takes an authentication service as parameter */
    this.authenticationService = authenticationService;

    /** @type {HTMLElement} */
    this.rootHtml = this.createHtml();
  }

  /**
   *
   * @returns {HTMLElement} - root html
   */
  html() {
    return this.rootHtml;
  }

  /**
   * Returns the HTML as string
   *
   * @returns {string} HTML as string
   */
  createHtml() {
    const result = document.createElement('div');
    result.id = AuthenticationView.HTML_ID;
    result.innerHTML = `
            <form id="RegistrationForm">\
                <h2>Registration</h2> \
                <h3 id="RegisterInfo" class=""></h3>
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
                
            </form>\
            \
            <form id="LoginForm">\
                <h2>Login</h2>\
                <h3 id="LoginInfo" class="ErrorBox"></h3>
                <label for="Login">Username</label>\
                <input type="text" id="login" name="username"/>\
                <label for=PasswordLogin>Password</label>\
                <input type="password" id="PasswordLogin" name="password"/>\
                <div>Forgot your password?</div>\
                <button type="button" id="LoginButton">Login</button>\
            </form>\
            <button id="loginRegistrationCloseButton">Close</button>\
        `;

    // register callbacks
    findChildByID(result, 'loginRegistrationCloseButton').onclick = () => {
      this.dispose();
    };
    findChildByID(result, 'LoginButton').onclick = () => {
      this.logInFunction();
    };
    findChildByID(result, 'RegisterButton').onclick = () => {
      this.registerFunction();
    };
    findChildByID(result, 'PasswordRegistration').onkeypress = () => {
      if (event.key == 'Enter') this.registerFunction();
    };
    findChildByID(result, 'PasswordLogin').onkeypress = () => {
      if (event.key == 'Enter') this.logInFunction();
    };

    return result;
  }

  /**
   * Remove its root html from the DOM
   */
  dispose() {
    this.rootHtml.remove();
  }

  /**
   * Display the register error
   *
   * @param {string} msg The message to display
   */
  displayRegisterError(msg) {
    const errorField = document.getElementById('RegisterInfo');
    errorField.className = 'ErrorBox';
    errorField.innerHTML = msg;
  }

  /**
   * Display the login error
   *
   * @param {string} msg The message to display
   */
  displayLoginError(msg) {
    const errorField = document.getElementById('LoginInfo');
    errorField.innerHTML = msg;
  }

  /**
   * Display the register success message
   *
   * @param {string} msg The message to display
   */
  displayRegisterSuccess(msg) {
    const successField = document.getElementById('RegisterInfo');
    successField.className = 'SuccessBox';
    successField.innerHTML = msg;
  }

  /**
   * Check if the window is visible
   *
   * @returns {boolean} True if the window is visible
   */
  isVisible() {
    const div = document.getElementById('loginRegistrationWindow');
    return div !== undefined && div !== null;
  }

  /**
   *
   * @param {Array<number|string>} formIds Array of IDs
   * @returns {boolean} True if all form values aren't empty
   */
  verifyNotEmptyValuesForm(formIds) {
    let validate = true;
    for (const id in formIds) {
      const element = document.getElementById(formIds[id]);
      element.setAttribute('style', '');
      if (element.value == '') {
        element.setAttribute('style', ' border: 3px solid red');
        validate = false;
      }
    }
    return validate;
  }

  /**
   * Delete the values of the form
   *
   * @param {Array<number|string>} formIds Array of IDs
   */
  deleteValuesForm(formIds) {
    for (const id in formIds) {
      const element = document.getElementById(formIds[id]);
      element.value = '';
    }
  }

  /**
   * Check if the mail is correct
   *
   * @returns {boolean} True if the the mail if correct
   */
  verifymail() {
    // This regular expression checks an email in the form of 'name@example.com'
    const emailRegex = new RegExp(
      /^[A-Za-z0-9_!#$%&'*+/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
      'gm'
    );
    const element = document.getElementById('Email');
    if (emailRegex.test(element.value)) {
      element.setAttribute('style', '');
      this.displayRegisterError('');
      return true;
    }
    element.setAttribute('style', ' border: 3px solid red');
    this.displayRegisterError('Please insert a valid mail');
    return false;
  }

  /**
   * It verifies that the login and password fields are not empty, then it calls the login function of
   * the authentication service
   */
  async logInFunction() {
    this.displayLoginError('');
    const loginForm = document.getElementById('LoginForm');
    const formData = new FormData(loginForm);
    const formIds = ['login', 'PasswordLogin'];
    if (this.verifyNotEmptyValuesForm(formIds)) {
      try {
        await this.authenticationService.login(formData);
      } catch (e) {
        if (e.status === 401) {
          this.displayLoginError('Login or password invalid');
        } else {
          this.displayLoginError(e);
        }
      }
    }
  }

  /**
   * Register a new user
   */
  async registerFunction() {
    this.displayRegisterError('');
    const registerForm = document.getElementById('RegistrationForm');
    const formData = new FormData(registerForm);
    const formIds = [
      'Firstname',
      'Lastname',
      'Username',
      'Email',
      'PasswordRegistration',
    ];
    if (this.verifyNotEmptyValuesForm(formIds) & this.verifymail()) {
      try {
        await this.authenticationService.register(formData);
        this.deleteValuesForm(formIds);
        this.displayRegisterSuccess('Your registration succeed');
      } catch (e) {
        if (e.status == '422') {
          this.displayRegisterError('The user already exist');
        } else {
          this.displayRegisterError(e.response || e);
        }
      }
    }
  }
}

AuthenticationView.HTML_ID = 'loginRegistrationWindow'; // => means we should create only one authentificationView

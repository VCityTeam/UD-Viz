import { createLabelInput } from '../../../../HTMLUtil';
import { AuthenticationService } from '../services/AuthenticationService';

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
    /** @type {AuthenticationService} */
    this.authenticationService = authenticationService;

    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    this.formRegistration = document.createElement('form');
    this.domElement.appendChild(this.formRegistration);

    const registrationTitle = document.createElement('h2');
    registrationTitle.innerText = 'Registration';
    this.formRegistration.appendChild(registrationTitle);

    this.firstNameRegistration = createLabelInput('firstName', 'text');
    this.formRegistration.appendChild(this.firstNameRegistration.parent);
    this.firstNameRegistration.input.setAttribute('name', 'firstName');

    this.lastNameRegistration = createLabelInput('lastName', 'text');
    this.formRegistration.appendChild(this.lastNameRegistration.parent);
    this.lastNameRegistration.input.setAttribute('name', 'lastName');

    this.usernameRegistration = createLabelInput('username', 'text');
    this.formRegistration.appendChild(this.usernameRegistration.parent);
    this.usernameRegistration.input.setAttribute('name', 'username');

    this.emailRegistration = createLabelInput('email', 'text');
    this.formRegistration.appendChild(this.emailRegistration.parent);
    this.emailRegistration.input.setAttribute('name', 'email');

    this.passwordRegistration = createLabelInput('password', 'password');
    this.formRegistration.appendChild(this.passwordRegistration.parent);
    this.passwordRegistration.input.setAttribute('name', 'password');

    this.buttonRegister = document.createElement('button');
    this.formRegistration.appendChild(this.buttonRegister);
    this.buttonRegister.innerText = 'Register';

    this.formLogin = document.createElement('form');
    this.domElement.appendChild(this.formLogin);

    const loginTitle = document.createElement('h2');
    loginTitle.innerText = 'Login';
    this.formLogin.appendChild(loginTitle);

    this.loginInfo = document.createElement('h3');
    this.formLogin.appendChild(this.loginInfo);

    this.usernameLogin = createLabelInput('Username', 'text');
    this.formLogin.appendChild(this.usernameLogin.parent);
    this.usernameLogin.input.setAttribute('name', 'username');

    this.passwordLogin = createLabelInput('Password', 'password');
    this.formLogin.appendChild(this.passwordLogin.parent);
    this.passwordLogin.input.setAttribute('name', 'password');

    const forgotYourPassword = document.createElement('div');
    forgotYourPassword.innerText = 'Forgot your password ?';
    this.formLogin.appendChild(forgotYourPassword);

    this.loginButton = document.createElement('button');
    this.formLogin.appendChild(this.loginButton);
    this.loginButton.innerText = 'Login';

    this.closeButton = document.createElement('button');
    this.closeButton.innerText = 'Close';
    this.domElement.appendChild(this.closeButton);

    // register callbacks
    this.closeButton.onclick = () => {
      this.domElement.remove();
    };
    this.loginButton.onclick = () => {
      this.logInFunction();
    };
    this.buttonRegister.onclick = () => {
      this.registerFunction();
    };
    this.passwordRegistration.onkeypress = (event) => {
      if (event.key == 'Enter') this.registerFunction();
    };
    this.passwordLogin.onkeypress = (event) => {
      if (event.key == 'Enter') this.logInFunction();
    };
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

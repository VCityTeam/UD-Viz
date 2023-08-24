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

    this.infoDomElement = document.createElement('h3');
    this.domElement.appendChild(this.infoDomElement);

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

    this.registrationButton = document.createElement('button');
    this.formRegistration.appendChild(this.registrationButton);
    this.registrationButton.setAttribute('name', 'register');
    this.registrationButton.setAttribute('type', 'button');
    this.registrationButton.innerText = 'Register';

    this.formLogin = document.createElement('form');
    this.domElement.appendChild(this.formLogin);

    const loginTitle = document.createElement('h2');
    loginTitle.innerText = 'Login';
    this.formLogin.appendChild(loginTitle);

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
    this.loginButton.setAttribute('type', 'button');

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
    this.registrationButton.onclick = () => {
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
   * Check if the window is visible
   *
   * @returns {boolean} True if the window is visible
   */
  isVisible() {
    return !!this.domElement.parentElement;
  }

  /**
   *
   * @param {Array<HTMLFormElement>} forms Array of forms
   * @returns {boolean} True if all form values aren't empty
   */
  verifyNotEmptyValuesForm(forms) {
    let validate = true;
    forms.forEach((element) => {
      if (element.value == '') {
        validate = false;
      }
    });
    return validate;
  }

  /**
   * Delete the values of the form
   *
   * @param {Array<HTMLFormElement>} forms Array of form
   */
  deleteValuesForm(forms) {
    forms.forEach((f) => (f.value = ''));
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
    if (emailRegex.test(this.emailRegistration.input.value)) {
      this.emailRegistration.input.setAttribute('style', '');
      this.infoDomElement.innerText = '';
      return true;
    }
    this.infoDomElement.innerText = 'Please insert a valid mail';
    return false;
  }

  /**
   * It verifies that the login and password fields are not empty, then it calls the login function of
   * the authentication service
   */
  async logInFunction() {
    this.infoDomElement.innerText = '';
    const formData = new FormData(this.formLogin);
    if (
      this.verifyNotEmptyValuesForm([
        this.usernameLogin.input,
        this.passwordLogin.input,
      ])
    ) {
      try {
        await this.authenticationService.login(formData);
      } catch (e) {
        if (e.status === 401) {
          this.infoDomElement.innerText = 'Login or password invalid';
        } else {
          this.infoDomElement.innerText = e;
        }
      }
    } else {
      this.infoDomElement.innerText = 'Fill username and password';
    }
  }

  /**
   * Register a new user
   */
  async registerFunction() {
    this.infoDomElement.innerText = '';
    const formData = new FormData(this.formRegistration);
    if (
      this.verifyNotEmptyValuesForm([
        this.firstNameRegistration.input,
        this.lastNameRegistration.input,
        this.usernameRegistration.input,
        this.emailRegistration.input,
        this.passwordRegistration.input,
      ]) & this.verifymail()
    ) {
      try {
        await this.authenticationService.register(formData);
        this.deleteValuesForm([
          this.firstNameRegistration.input,
          this.lastNameRegistration.input,
          this.usernameRegistration.input,
          this.emailRegistration.input,
          this.passwordRegistration.input,
        ]);
        this.infoDomElement.innerText = 'Your registration succeed';
      } catch (e) {
        if (e.status == '422') {
          this.infoDomElement.innerText = 'The user already exist';
        } else {
          this.infoDomElement.innerText = e.response || e;
        }
      }
    }
  }
}

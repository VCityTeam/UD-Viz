export function AuthenticationController() {
    this.initialize = function initialize() {
        console.log('Controller init');
    }

    this.login = function login(params) {
        console.log('login !');
        //mock request
        const jwt = /*request*/ 'test.jwt.test';
        window.sessionStorage.setItem('token', jwt);
    }

    this.logout = function logout() {
        console.log('logout !');
        window.sessionStorage.removeItem('token');
    }

    this.register = function register(params) {
        console.log('register !');
        console.log(params);
    }

    this.initialize();
}
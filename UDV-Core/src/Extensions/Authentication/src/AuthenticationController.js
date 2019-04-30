export function AuthenticationController() {
    this.initialize = function initialize() {
        console.log('Controller init');
    }

    this.login = function login(params) {
        console.log('login !');
        //mock request
        jwt = /*request*/ 'test.jwt.test';
        console.log(params);
    }

    this.logout = function logout() {
        console.log('logout !');
    }

    this.register = function register(params) {
        console.log('register !');
        console.log(params);
    }

    this.initialize();
}
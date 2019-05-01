export function AuthenticationController(config) {
    this.config = config;
    this.loginUrl = `${config.server.url}${config.server.login}`;
    this.registerUrl = `${config.server.url}${config.server.register}`;
    this.requestService = new udvcore.RequestService();
    this.loginRequiredKeys = ['username', 'password'];
    this.registerRequiredKeys = ['username', 'firstName', 'lastName', 'password', 'email'];

    this.initialize = function initialize() {
        console.log('Controller init');
    }

    this.login = async function login(formData) {
        if (!this.formCheck(formData, this.loginRequiredKeys)) {
            throw 'Invalid form';
        }

        if (window.sessionStorage.getItem('token') !== null) {
            throw 'Already logged in';
        }

        const result = await this.requestService.send('POST', this.loginUrl, formData, false);
        const obj = JSON.parse(result);
        const jwt = obj.token;
        if (jwt !== undefined && jwt !== null) {
            window.sessionStorage.setItem('token', jwt);
        }
    }

    this.logout = function logout() {
        window.sessionStorage.removeItem('token');
    }

    this.register = async function register(formData) {
        if (!this.formCheck(formData, this.loginRequiredKeys)) {
            throw 'Invalid form';
        }

        if (window.sessionStorage.getItem('token') !== null) {
            throw 'Already logged in';
        }

        const result = await this.requestService.send('POST', this.registerUrl, formData, false);
        const obj = JSON.parse(result);
        return obj;
    }

    this.formCheck = function formCheck(formData, requiredKeys) {
        for (var key of requiredKeys) {
            if (formData.get(key) === null) {
                console.error(`Missing key in form : ${key}`)
                return false;
            }
        }
        return true;
    }

    this.initialize();
}
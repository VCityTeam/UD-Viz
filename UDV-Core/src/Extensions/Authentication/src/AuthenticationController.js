export function AuthenticationController(authenticationService) {
    this.authenticationService = authenticationService;
    
    this.initialize = function initialize() {
    }

    this.login = async function login(formData) {
        if (!this.authenticationService.formCheck(formData, this.authenticationService.loginRequiredKeys)) {
            throw 'Invalid form';
        }

        if (this.authenticationService.isUserLoggedIn()) {
            throw 'Already logged in';
        }

        await this.authenticationService.login(formData);
    }

    this.logout = function logout() {
        if (!this.authenticationService.isUserLoggedIn()) {
            throw 'Not logged in';
        }

        this.authenticationService.logout();
    }

    this.register = async function register(formData) {
        if (!this.authenticationService.formCheck(formData, this.authenticationService.registerRequiredKeys)) {
            throw 'Invalid form';
        }

        if (this.authenticationService.isUserLoggedIn()) {
            throw 'Already logged in';
        }

        await this.authenticationService.register(formData);
    }

    this.initialize();
}
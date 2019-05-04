export function RequestService() {
    this.authenticationService;
    this.useAuthentication = false;

    this.initialize = function () {
        console.log('Request service initialized');
    };

    this.send = function (method, url, body = '', authenticate = true) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open(method, url);

            if (this.useAuthentication && authenticate) {
                const token = window.sessionStorage.getItem('user.token');
                if (token === null) {
                    reject('Login needed for this request');
                    return;
                }
                req.setRequestHeader('Authorization', token);
            }

            if (method === 'GET' || method === 'DELETE') {
                req.send(null);
            } else if (method === 'POST' || method === 'PUT' || method === 'UPDATE') {
                req.send(body);
            }

            req.onload = () => {
                if (req.status >= 200 && req.status < 300) {
                    resolve(req);
                } else {
                    reject(req);
                }
            }
        });
    };

    this.setAuthenticationService = function (authenticationService) {
        this.authenticationService = authenticationService;
        this.useAuthentication = true;
    };

    this.initialize();
}
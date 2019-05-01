export function RequestService() {
    this.useAuthentication;

    this.initialize = function () {
        if (typeof udvcore.AuthenticationController !== 'undefined') {
            this.useAuthentication = true;
        } else {
            this.useAuthentication = false;
        }
    }

    this.send = function (method, url, body = '', authenticate = true) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open(method, url);

            if (this.useAuthentication && authenticate) {
                const token = window.sessionStorage.getItem('token');
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
                if (req.status === 200) {
                    resolve(req.response);
                } else {
                    reject(req.status);
                }
            }
        });
    }

    this.initialize();
}
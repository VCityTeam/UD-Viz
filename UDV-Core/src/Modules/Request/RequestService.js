export function RequestService() {
    this.useAuthentication;

    this.initialize = function () {
        try {
            const authenticationController = new udvcore.AuthenticationController();
            console.log('Requests use authentication');
            this.useAuthentication = true;
        } catch (e) {
            console.log('Requests don\'t use authentication');
            this.useAuthentication = false;
        }
    }

    this.send = function (method, url, body = '') {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open(method, url);

            if (this.useAuthentication) {
                const token = window.sessionStorage.getItem('token');
                if (token === null) {
                    reject('Login needed for this request');
                    return;
                }
                req.setRequestHeader('Authorization', token);
            }

            if (method === 'GET' || method === 'DELETE') {
                req.send(null);
            } else if (method === 'POST' || method === 'PUT') {
                req.send(body);
            }

            req.onload = () => {
                if (req.status === 200) {
                    resolve(req.response);
                } else {
                    reject(req.statusText);
                }
            }
        });
    }

    this.initialize();
}
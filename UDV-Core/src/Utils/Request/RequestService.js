// Service used to make HTTP requests and manage authentication
// Wiki : https://github.com/MEPP-team/UDV/wiki/Request-Service#request-service
export function RequestService() {
    this.authenticationService;
    this.useAuthentication = false;

    this.initialize = function () {

    };

    /**
     * @deprecated Prefer using `RequestService.request` instead.
     */
    this.send = function (method, url, body = '', authenticate = true) {
        return this.request(method, url, {
            body: body,
            authenticate: authenticate
        });
    };

    /**
     * Performs an HTTP request.
     * 
     * @async
     * @param {string} method The HTTP method. Accepted methods include `GET`,
     * `DELETE`, `POST` and `PUT`.
     * @param {string} url The requested URL.
     * @param {object} options A dictionnary of optional parameters. These
     * options include  
     * - `body` : the request body
     * - `authenticate` : set to false if you don't want the request to use
     * authentication
     * - `responseType` : the expected response type.
     * - `urlParameters` : A dictionnary of url parameters.
     */
    this.request = (method, url, options = {}) => {
        let args = options || {};
        let body = args.body || '';
        let authenticate = (args.authenticate !== null
                            && args.authenticate !== undefined)?
                            args.authenticate : true;
        let responseType = args.responseType || null;
        let urlParameters = args.urlParameters || null;
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            if (!!urlParameters) {
                url += '?';
                for (let [paramKey, paramValue] of Object.entries(urlParameters)) {
                    url += `${encodeURIComponent(paramKey)}=${encodeURIComponent(paramValue)}&`;
                }
            }
            req.open(method, url, true);

            if (this.useAuthentication && authenticate) {
                const token = window.sessionStorage.getItem('user.token');
                if (token === null) {
                    reject(new AuthNeededError());
                    return;
                }
                req.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            if (!!responseType) {
                req.responseType = responseType;
            }
            
            req.send(body);

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

export class AuthNeededError extends Error {
    constructor() {
        super('Login needed for this request');
        this.name = 'AuthNeededError';
    }
}
import { Exception } from './exception';


export class AuthorizationException extends Exception {

    constructor(message?: string) {
        super(message || 'requared authentication');
        super.setStatus(403);

        Error.captureStackTrace(this, AuthorizationException);
        Object.setPrototypeOf(this, AuthorizationException.prototype);
    }
}

Exception.registerByName(AuthorizationException, 'authorization', (src) => {
    return new AuthorizationException(src.message);
})
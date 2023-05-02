import { Exception } from './exception';


export class AuthenticationException extends Exception {

    constructor(message: string) {
        super(message);
        super.setStatus(401);
        Error.captureStackTrace(this, AuthenticationException);
        Object.setPrototypeOf(this, AuthenticationException.prototype);
    }
}

Exception.registerByName(AuthenticationException, 'authentication', (src) => {
    return new AuthenticationException(src.message);
})
import { Exception } from './exception';
import { ExceptionNames } from './names';


/**
 * @deprecated use - new Exception('error message', ExceptionNames.Authentication)
 */
export class AuthenticationException extends Exception {

    constructor(message: string) {
        super(message, { name: ExceptionNames.Authentication });
        Error.captureStackTrace(this, AuthenticationException);
        Object.setPrototypeOf(this, AuthenticationException.prototype);
    }
}
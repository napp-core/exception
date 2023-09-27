import { Exception } from './exception';
import { ExceptionNames } from './names';

/**
 * @deprecated use - new Exception('error message', ExceptionNames.Authorization)
 */
export class AuthorizationException extends Exception {

    constructor(message?: string) {
        super(message || 'requared authentication', {name: ExceptionNames.Authorization});

        Error.captureStackTrace(this, AuthorizationException);
        Object.setPrototypeOf(this, AuthorizationException.prototype);
    }
}

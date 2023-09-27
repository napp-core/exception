import { Exception } from './exception';
import { ExceptionNames } from './names';


/**
 * @deprecated use - new Exception('error message', ExceptionNames.Network)
 */
export class NetworkException extends Exception {

    constructor(message: string) {
        super(message, {name:ExceptionNames.Network});

        Error.captureStackTrace(this, NetworkException);
        Object.setPrototypeOf(this, NetworkException.prototype);
    }


}

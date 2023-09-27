import { Exception } from './exception';
import { ExceptionNames } from './names';


/**
 * @deprecated use - new Exception('error message', ExceptionNames.Timeout)
 */
export class TimeoutException extends Exception {


    constructor(message: string) {
        super(message, {name:ExceptionNames.Timeout});
        Error.captureStackTrace(this, TimeoutException);
        Object.setPrototypeOf(this, TimeoutException.prototype);
    }
}

import { Exception } from './exception';
import { ExceptionNames } from './names';


/**
 * @deprecated use - new Exception('error message', ExceptionNames.Validation)
 */
export class ValidationException extends Exception {

    constructor(message: string) {
        super(message, { name: ExceptionNames.Validation });


        Error.captureStackTrace(this, ValidationException);
        Object.setPrototypeOf(this, ValidationException.prototype);
    }

}
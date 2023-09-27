import { Exception } from "./exception";
import { ExceptionNames } from "./names";


/**
 * @deprecated use - new Exception('error message', ExceptionNames.Notfound)
 */
export class NotfoundException extends Exception {

    constructor(message: string) {
        super(message, {name:ExceptionNames.Notfound});

        Error.captureStackTrace(this, NotfoundException);
        Object.setPrototypeOf(this, NotfoundException.prototype);
    }
}


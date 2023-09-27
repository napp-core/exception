import { Exception } from "./exception";
import { ExceptionNames } from "./names";


/**
 * @deprecated use - new Exception('error message', ExceptionNames.NotSupported)
 */
export class NotSupportedException extends Exception {

    constructor(message: string) {
        super(message, {name:ExceptionNames.NotSupported});

        Error.captureStackTrace(this, NotSupportedException);
        Object.setPrototypeOf(this, NotSupportedException.prototype);
    }
}


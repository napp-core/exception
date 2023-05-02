import { Exception } from "./exception";

export class NotSupportedException extends Exception {
    
    constructor(message: string) {
        super(message);

        Error.captureStackTrace(this, NotSupportedException);
        Object.setPrototypeOf(this, NotSupportedException.prototype);
    }
}

Exception.registerByName(NotSupportedException, 'notSupported',(src) => {
    return new NotSupportedException(src.message);
})
import { Exception, Type } from './exception';

export class ValidationException extends Exception {

    constructor(message: string) {
        super(message);
        super.setStatus(400)

        Error.captureStackTrace(this, ValidationException);
        Object.setPrototypeOf(this, ValidationException.prototype);
    }

}





Exception.registerByName(ValidationException, 'validation', (src) => {
    return new ValidationException(src.message);
})

import { Exception } from './exception';


export class TimeoutException extends Exception {


    constructor(message: string) {
        super(message);
        Error.captureStackTrace(this, TimeoutException);
        Object.setPrototypeOf(this, TimeoutException.prototype);
    }
}

Exception.registerByName(TimeoutException, 'timeout', (src) => {
    return new TimeoutException(src.message);
})
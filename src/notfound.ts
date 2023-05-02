import { ValidationException } from "./validation";



export class NotfoundException extends ValidationException {

    constructor(message: string) {
        super(message);
        super.setStatus(404);

        Error.captureStackTrace(this, NotfoundException);
        Object.setPrototypeOf(this, NotfoundException.prototype);
    }
}

ValidationException.registerByName(NotfoundException, 'notfound', (src) => {
    return new NotfoundException(src.message);
})
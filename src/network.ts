import { Exception, Type } from './exception';

export class NetworkException extends Exception {



    constructor(message: string) {
        super(message);

        Error.captureStackTrace(this, NetworkException);
        Object.setPrototypeOf(this, NetworkException.prototype);
    }


}





Exception.registerByName(NetworkException, 'network', (src) => {
    return new NetworkException(src.message);
})

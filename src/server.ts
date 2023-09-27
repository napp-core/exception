import { Exception } from './exception';
import { ExceptionNames } from './names';


/**
 * @deprecated use - new Exception('error message', ExceptionNames.Server)
 */
export class ServerException extends Exception {


  constructor(message: string) {
    super(message, {name:ExceptionNames.Server});


    Error.captureStackTrace(this, ServerException);
    Object.setPrototypeOf(this, ServerException.prototype);
  }
}
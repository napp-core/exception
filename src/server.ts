import { Exception } from './exception';


export class ServerException extends Exception {

  
  constructor(message: string) {
    super(message);
    super.setStatus(500);

    Error.captureStackTrace(this, ServerException);
    Object.setPrototypeOf(this, ServerException.prototype);
  }
}

Exception.registerByName(ServerException,'server', (src) => {
  return new ServerException(src.message);
})
import { Exception, IException, IExceptionSubOption } from "./exception";

export class AuthenticationException extends Exception<IException> {
    constructor(message: string, opt?: IExceptionSubOption<IException>) {
        super(message, { ...opt, kind: 'authentication' })
    }
}


export interface EAuthorization extends IException {
    /**
     * Requared access information
     */
    required: string;

}

export class AuthorizationException extends Exception<EAuthorization> {
    constructor(message: string, opt: IExceptionSubOption<EAuthorization>) {
        super(message, { ...opt, kind: 'authorization' })
    }
}

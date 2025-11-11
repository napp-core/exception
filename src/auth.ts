import { Exception, IException } from "./exception";

export interface EAuthentication extends IException {

}

export class AuthenticationException extends Exception<EAuthentication> {
    constructor(opt: EAuthentication) {
        super({ ...opt, kind: 'authentication' })
    }
}


export interface EAuthorization extends IException {
    /**
     * Requared access information
     */
    required: string;

}

export class AuthorizationException extends Exception<EAuthorization> {
    constructor(opt: EAuthorization) {
        super({ ...opt, kind: 'authorization' })
    }
}

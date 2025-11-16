import { Exception, IException } from "./exception";

export interface EValidationItem {
    path?: string;
    reason?: string
    message: string
}
export interface EValidation extends IException {

    errors?: Array<EValidationItem>
}

export class ValidationException extends Exception<EValidation> {
    constructor(opt: EValidation) {
        super({ ...opt, kind: 'validation' })
    }

    static isValidationExcepion(ex: unknown): ex is Exception<EValidation> {
        return ex instanceof Exception && ex.error.kind === 'validation'
    }
}
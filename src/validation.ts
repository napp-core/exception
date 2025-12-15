import { Exception, IException, IExceptionSubOption } from "./exception";

export interface EValidationItem {
    path?: string;
    reason?: string
    message: string
}
export interface EValidation extends IException {

    errors?: Array<EValidationItem>
}


export class ValidationException extends Exception<EValidation> {
    constructor(message: string, opt?: IExceptionSubOption<EValidation>) {
        super(message, { ...opt, kind: 'validation' })
    }

    static isValidationExcepion(ex: unknown): ex is Exception<EValidation> {
        return (
            typeof ex === 'object' &&
            ex !== null &&
            (ex as any).exception?.kind === 'validation'
        )
    }
}
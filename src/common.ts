

export interface IException {
    name: string;
    code?: string;
    message: string;    
    cause?: IException;    
}



export type ExceptionType =
    | 'Validation'
    | 'Authentication'
    | 'Authorization'
    | 'NotFound'
    | 'Conflict'
    | 'Timeout'
    | 'TooManyRequests'
    | 'Unsupported'
    | 'Database'
    | 'Network'
    | 'ServiceUnavailable'
    | 'Internal'
    | 'Unknown'
    | (string & {}); // Allow custom types

export interface IException {
    message: string;

    type?: string;
    code?: string;

    cause?: IException;
    // stack?: string;

    data?: any;
    isOperational?: boolean;
}

export interface IExceptionParser {
    parse(err: any): Exception | false
}

export interface ExceptionOption {
    type?: ExceptionType;
    code?: string;

    cause?: any;
    source?: any;

    data?: any;
    isOperational?: boolean;

    httpStatus?: number;
}
function safeStringify(obj: any): any {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return null;
    }
}
export class Exception extends Error implements IException {

    type?: ExceptionType;
    code?: string;

    cause?: Exception;
    stack?: string;
    source?: any;

    data?: any;
    isOperational?: boolean;
    httpStatus?: number;



    constructor(message: string, opt?: ExceptionOption) {
        super(message);

        if (opt && opt.type) {
            this.setErrorType(opt.type)
        }
        if (opt && opt.code) {
            this.setErrorCode(opt.code)
        }

        if (opt && opt.cause) {
            this.setCause(opt.cause)
        }

        if (opt && opt.source) {
            this.setSource(opt.source)
        }

        if (opt && opt.data) {
            this.setData(opt.data)
        }
        if (opt && (opt.isOperational === true || opt.isOperational === false)) {
            this.setOperational(opt.isOperational)
        }

        if (opt && opt.httpStatus) {
            this.setHttpStatus(opt.httpStatus)
        }


        if (typeof (Error as any).captureStackTrace === 'function') {
            (Error as any).captureStackTrace(this, Exception);
        }
        Object.setPrototypeOf(this, Exception.prototype);
    }

    setErrorType(type: ExceptionType) {
        this.type = type;
        return this;
    }
    setErrorCode(code: string) {
        this.code = code;
        return this;
    }




    setCause(err: any) {
        this.cause = Exception.from(err);
        return this;
    }

    setSource(source: any) {
        this.source = source;
        return this;
    }

    setData(data: any) {
        this.data = data;
        return this;
    }

    setOperational(isOperational: boolean) {
        this.isOperational = isOperational;
        return this;
    }

    setHttpStatus(status: number) {
        this.httpStatus = status;
        return this;
    }


    toJSON(): IException {
        let obj: IException = {
            message: this.message,

            type: this.type,
            code: this.code,

            isOperational: this.isOperational,
        };
        if (this.data) {
            try {
                obj.data = safeStringify(this.data);
            } catch (error) {
                obj.data = null; // If serialization fails, set data to null
            }
        }

        if (this.cause) {
            obj.cause = this.cause.toJSON()
        }

        // if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        //     (obj as any).httpStatus = this.httpStatus;
        //     (obj as any).source = this.source;
        // }

        return obj;
    }




    private static merge(target: Exception, src: any) {
        if (!src || typeof src !== 'object') return target;

        // Error type/category
        target.type =
            src.type ??
            src.category ??
            src.errorType ??
            src.name ?? // fallback to Error name
            target.type;

        // Error code variations
        target.code =
            src.code ??
            src.ecode ??
            src.errorCode ??
            src.statusCode ??
            src.status_code ??
            target.code;


        if (src?.cause) target.cause = Exception.from(src.cause);

        if (src?.data !== undefined) target.data = src.data;

        if (typeof src?.stack === 'string') target.stack = src.stack;

        // isOperational flag
        target.isOperational =
            src.isOperational ??
            src.operational ??
            (typeof src.name === 'string' && src.name.toLowerCase().includes("validation")) ??
            target.isOperational;

        // HTTP status
        target.httpStatus =
            src.httpStatus ??
            src.status ??
            src.status_code ??
            (typeof src.code === 'number' ? src.code : undefined) ??
            target.httpStatus;

        return target;
    }

    public static httpStatusByType(type: ExceptionType): number | undefined {
        switch (type) {
            case 'Validation': return 400;
            case 'Authentication': return 401;
            case 'Authorization': return 403;
            case 'NotFound': return 404;
            case 'Conflict': return 409;
            case 'Timeout': return 408;
            case 'TooManyRequests': return 429;
            case 'ServiceUnavailable': return 503;
            case 'Internal': return 500;
            case 'Unsupported': return 415;
            case 'Database': return 500; // Database errors are often internal
            case 'Network': return 502; // Network errors can be considered as bad gateway
            case 'Unknown': return 500; // Unknown errors are often internal
        }
        return undefined
    }

    public static from(err: any, customParser?: IExceptionParser): Exception {
        if (customParser && typeof customParser.parse === 'function') {
            const parsed = customParser.parse(err);
            if (parsed instanceof Exception) return parsed;
        }

        if (err instanceof Exception) {
            return err;
        }



        if (err instanceof Error) {
            const exception = new Exception(err.message, { source: err });
            return Exception.merge(exception, err);
        }

        if (typeof err === 'object' && typeof err?.message === 'string') {
            const exception = new Exception(err.message, { source: err });
            return Exception.merge(exception, err);
        }

        return new Exception("Unknown error", { type: "Unknown", source: err })
    }
}
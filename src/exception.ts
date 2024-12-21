import { IException } from "./common";


export type IExceptionData = Record<string, any>;

export interface ExceptionOption {
    name: string;
    code?: string;
    data?: IExceptionData;
    cause?: IException;
    source?: any;
    stack?: string;
}



export interface IExceptionParser {
    parse(err: any): Exception | false
}
export class ExceptionParser implements IExceptionParser {

    private resolve(e: Exception, err: any) {
        if (err?.name) e.name = '' + err.name;
        if (err?.code) e.code = '' + err.code;
        if (err?.cause) e.cause = err.cause;
        // if (err?.stack) e.stack = err.stack;
        // if (err?.data) e.data = err.data;
        // if (err?.source) e.source = err.source;
        return e;
    }

    public parse(err: any) {
        if (err instanceof Exception) {
            return err;
        }

        if (err instanceof Error) {
            let e = new Exception(err.message, { name: "exception", source: err });
            return this.resolve(e, err);
        }

        if (err && err.message) {
            let e = new Exception(err.message, { name: "exception", source: err });
            return this.resolve(e, err);
        }


        return false
    }

}

export class Exception extends Error implements IException {

    public static Authorization: string = "authorization";
    public static Authentication: string = "authentication";
    public static Notfound: string = "notfound";
    public static Validation: string = "validation";
    public static Unsupported: string = "unsupported";
    public static Unavailable: string = "unavailable";
    public static InternalServer: string = "internal-server";
    public static Timeout: string = "timeout";

    code?: string;
    cause?: IException;
    stack?: string;
    data?: IExceptionData;
    source?: any;


    constructor(msg: string | [code: string, message: string], opt?: ExceptionOption) {
        if (Array.isArray(msg) && msg.length === 2) {
            super(msg[1]);
            this.code = msg[0];
        } else {
            super(msg);
        }

        if (opt && opt.name) {
            this.name = opt.name
        } else {
            this.name = "exception"
        }
        if (opt && opt.code) {
            this.setCode(opt.code)
        }
        if (opt && opt.data) {
            this.setData(opt.data)
        }

        if (opt && opt.cause) {
            this.setCause(opt.cause)
        }
        if (opt && opt.source) {
            this.setSource(opt.source)
        }
        if (opt && opt.stack) {
            this.setStack(opt.stack)
        }


        Error.captureStackTrace(this, Exception);
        Object.setPrototypeOf(this, Exception.prototype);
    }

    setName(name: string) {
        this.name = name;
        return this;
    }
    setCode(code: string) {
        this.code = code;
        return this;
    }
    setMessage(msg: string) {
        this.message = msg;
        return this;
    }

    setData(data: IExceptionData) {
        this.data = data;
        return this;
    }

    setCause(err: any) {
        this.cause = Exception.from(err).toPlan();

        return this;
    }

    setSource(source: any) {
        this.source = source;
        return this;
    }

    setStack(stack: string) {
        this.stack = stack;
        return this;
    }








    // static __to_json_have_stack = false;
    toPlan() {

        let obj: IException = {
            name: this.name,
            code: this.code,
            message: this.message,
            cause: this.cause,
        };

        return obj;
    }


    toJSON() {
        return this.toPlan();
    }




    static parser: IExceptionParser = new ExceptionParser()



    static from(err: any, parser?: IExceptionParser): Exception {
        if (err instanceof Exception) {
            return err;
        }

        if (parser) {
            let e = parser.parse(err)
            if (e instanceof Exception) {
                return e;
            }
        }

        let e = Exception.parser.parse(err)
        if (e instanceof Exception) {
            return e;
        }

        return new Exception("Unknown error").setSource(err)
    }
}


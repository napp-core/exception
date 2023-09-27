import { ExceptionNames } from "./names";

export type IDataValue =
    | string
    | number
    | boolean
    | null
    | { [x: string]: IDataValue }
    | Array<IDataValue>;

export type IDataType = Record<string, IDataValue>;
export type IMessage = string | [string, IDataType];

export interface IException {
    name: string;
    message: string;
    data?: IDataType;
    cause?: IException;
    stack?: string;
}
export interface ExceptionOption {
    name: string;
    cause?: IException | Exception;
}

function isString(x: any): x is string {
    return (typeof x == 'string') || (x instanceof String)
}

export class Exception extends Error implements IException {

    cause?: IException;
    stack?: string;
    data?: IDataType;

    constructor(msg: IMessage, opt?: ExceptionOption) {
        if (Array.isArray(msg)) {
            super(msg[0]);
            this.data = msg[1];
        } else {
            super(msg);
        }

        if (opt && opt.name) {
            this.name = opt.name
        } else {
            this.name = ExceptionNames.Exception
        }

        if (opt && opt.cause) {
            this.setCause(opt.cause)
        }




        Error.captureStackTrace(this, Exception);
        Object.setPrototypeOf(this, Exception.prototype);
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setMessage(msg: IMessage) {
        if (Array.isArray(msg)) {
            this.message = msg[0];
            this.data = msg[1];
        } else {
            this.message = msg;
        }
        return this;
    }

    private static templater(tpl: string, data: IDataType): string {
        const names = Object.keys(data);
        const vals = Object.values(data);
        return new Function(...names, `return \`${tpl}\`;`)(...vals);
    }

    toMessage() {
        try {
            return Exception.templater(this.message, this.data || {})
        } catch (error) {
            return this.message
        }

    }

    setData(data: IDataType) {
        this.data = data;
        return this;
    }


    setStack(stack: string) {
        this.stack = stack;
        return this;
    }




    setCause(err: IException | Exception) {
        if (err instanceof Exception) {
            this.cause = err.toPlan();
        } else {
            this.cause = Exception.from(err).toPlan();
        }

        return this;
    }

    static __to_json_have_stack = false;
    toPlan(have_stack?: boolean) {

        let obj: IException = {
            name: this.name,
            message: this.message,
            data: this.data,
            stack: have_stack ? this.stack : undefined,
            cause: this.cause
        };

        return obj;
    }


    toJSON() {
        return this.toPlan(Exception.__to_json_have_stack);
    }







    private static resolve(e: Exception, err: any) {
        if (err?.name) e.name = err.name;
        if (err?.cause) e.cause = err.cause;
        if (err?.stack) e.stack = err.stack;
        if (err?.data) e.data = err.data;
        return e;
    }
    static from<T extends Exception>(err: any): Exception | T {
        if (err instanceof Exception) {
            return err;
        }

        if (err instanceof Error) {
            let e = new Exception(err.message);
            return Exception.resolve(e, err);
        }

        if (err && err.message) {
            let e = new Exception(err.message);
            return Exception.resolve(e, err);
        }
        if (err && err.error) {
            let e = new Exception(err.error);
            return Exception.resolve(e, err);
        }

        if (isString(err)) {
            return new Exception(err)
        }



        let e = new Exception("Unknown error");
        e.cause = err;
        return e;
    }
}


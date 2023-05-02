export interface IExceptionParam {
    title?: string;
    help?: string;
    traceid?: string;
    stack?: string;
    status?: number;
    code?: string;
    exceptions?: Array<IException>
}
export interface IException extends IExceptionParam {
    ref: string;
    message: string;
}

export type TParser<T extends IException> = (err: T) => T
//export interface TParser<T> extends Function { (src: IException): T; }
export interface Type<T extends Exception> extends Function { new(...args: any[]): T; }


function getClassNames<T extends Exception>(tClss: Type<T>): string[] {
    if (tClss instanceof Function) {

        // let name = tClss.hasOwnProperty("type") ? (tClss as any).type : tClss.name;
        const name = tClss.name;

        const nClss = Object.getPrototypeOf(tClss);

        if (nClss && nClss.name && nClss !== Object && nClss !== Error) {
            let parants = getClassNames(nClss);
            return [...parants, name]
        }

        return [name];
    }
    return []
}

function isString(x: any): x is string {
    return (typeof x == 'string') || (x instanceof String)
}

export class Exception extends Error implements IException {
    readonly ref!: string;
    src?: any;
    code?: string;
    title?: string;
    help?: string;
    traceid?: string;
    status?: number;
    exceptions?: Array<IException>;

    constructor(message: string) {
        super(message);

        Error.captureStackTrace(this, Exception);
        Object.setPrototypeOf(this, Exception.prototype);
    }

    setTitle(title: string) {
        this.title = title;
        return this;
    }

    setHelp(help: string) {
        this.help = help;
        return this;
    }

    setTraceid(traceid: string) {
        this.traceid = traceid;
        return this;
    }

    setStatus(status: number) {
        this.status = status;
        return this;
    }

    setSrc(src: any) {
        this.src = src;
        return this;
    }

    addException(...errs: Exception[]) {
        this.exceptions = this.exceptions || [];
        this.exceptions.push(...errs);
        return this;
    }

    static __to_json_have_stack = false;
    toPlan(have_stack?: boolean) {

        let obj: any = Object.assign({}, this);
        obj.ref = this.ref;
        obj.message = this.message;
        if (this.title) obj.title = this.title;
        if (this.help) obj.help = this.help;
        if (this.traceid) obj.traceid = this.traceid;
        if (have_stack && this.stack) obj.stack = this.stack;
        if (this.status) obj.status = this.status;
        if (this.code) obj.status = this.code;
        if (Array.isArray(this.exceptions)) {
            obj.exceptions = this.exceptions.map(it => Exception.from(it).toPlan());
        }
        return obj as (typeof this);
    }


    toJSON() {
        return this.toPlan(Exception.__to_json_have_stack);
    }

    private static _parser = new Map<string, TParser<any>>();
    static register<T extends Exception>(type: Type<T>, parser: TParser<T>) {
        let ref = getClassNames(type).join('.');

        Exception.registerByName(type, ref, parser)
    };

    static registerByName<T extends Exception>(type: Type<T>, ref: string, parser: TParser<T>) {

        if (Exception._parser.has(ref)) {
            throw new ReferenceError(`the "${type}" exception is registered`);
        }

        type.prototype.ref = ref;
        Exception._parser.set(ref, parser)
    };






    private static resolve(e: Exception, err: any) {
        if (err?.title) e.title = err.title;
        if (err?.help) e.help = err.help;
        if (err?.traceid) e.traceid = err.traceid;
        if (err?.stack) e.stack = err.stack;
        if (err?.status) e.status = err.status;
        if (err?.code) e.status = err.code;

        if (Array.isArray(err.exceptions)) {
            e.exceptions = err.exceptions.map((it: any) => Exception.from(it));
        }
        return e;
    }
    static from<T extends Exception>(err: any): Exception | T {
        if (err instanceof Exception) {
            return err;
        }

        if (err instanceof Error) {
            let e = new Exception(err.message);
            return Exception.resolve(e, err).setSrc(err);
        }

        if (err && isString(err.ref) && isString(err.message)) {
            let ref: string = err.ref;
            let parser = this._parser.get(ref);
            if (parser) {
                let e: Exception = parser(err);
                return Exception.resolve(e, err);
            }

            let e = new Exception(err.message);
            return Exception.resolve(e, err).setSrc(err);
        }


        if (err && err.message) {
            let e = new Exception(err.message);
            return Exception.resolve(e, err).setSrc(err);
        }
        if (err && err.error) {
            let e = new Exception(err.error);
            return Exception.resolve(e, err).setSrc(err);
        }

        return new Exception("Not suppored error format").setSrc(err);
    }
}

(Exception.prototype as any).ref = "exception"
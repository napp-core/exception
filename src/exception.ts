import { VERSION } from "./version";


export type Kind =
    | 'authentication'
    | 'authorization'
    | 'validation'
    | 'notfound'
    | 'conflict'
    | 'timeout'
    | 'toomanyrequests'
    | 'serviceunavailable'
    | 'internal'
    | 'unsupported'
    | 'database'
    | 'network'
    | 'unknown'
    | (string & {}); // Allow custom types

export interface IException {
    /**
    * ямар төрлийн error болох тодорхойлно
    * энэ нь ямар бүтэцтэй, алдааг яаж түрслэх(UI) зэрэгийг прагамп танийлах зорилготой
    */
    kind?: Kind;

    code?: string | number
    status?: number
    help?: string
    instance?: string
    trace_id?: string
    span_id?: string
    request_id?: string
};

export type IExceptionPlan<E extends IException> = {
    $exception: string;
    /**
     * хэрэглэгчид ойлгомтой алааны товч агуулга
     */
    message: string;
    exception: E
    cause?: IExceptionPlan<any>
};


export type IExceptionOption<T> = T & ErrorOptions & {
    source?: unknown
}

export type IExceptionSubOption<T> = Omit<IExceptionOption<T>, 'kind'>


export interface IExceptionParser<E extends IException> {
    parse(err: any): Exception<E> | undefined
}




export class Exception<E extends IException = IException> extends Error {
    readonly exception: E

    constructor(message: string, opt?: IExceptionOption<E>) {
        super(message, { cause: opt?.cause })
        this.name = opt?.kind
            ? `${this.constructor.name}/${opt.kind}`
            : this.constructor.name ?? "Exception";

        this.exception = Object.freeze(Exception.clone<any>({
            ...(opt ?? {}),
            cause: undefined,
            source: undefined
        }))
    }

    toJSON(): IExceptionPlan<E> {
        return {
            message: this.message,
            $exception: VERSION,
            exception: this.exception,
            cause: Exception.tryFrom<any>(this.cause)?.toJSON(),
        };
    }

    static clone<T>(obj: T): T {
        try {
            // Node 18+/modern browsers
            // @ts-ignore
            if (typeof structuredClone === "function") return structuredClone(obj);
        } catch { }
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch {
            return {
                ...obj
            }
        }
    }
    private static VERSION_MAJOR: string = VERSION.split(".")[0];
    static isExceptionPlan<E extends IException>(err: any): err is IExceptionPlan<E> {
        let e: IExceptionPlan<IException> = err;
        return !!(
            typeof e === 'object'
            && (typeof e.$exception) === 'string'
            && e.$exception.split(".")[0] === Exception.VERSION_MAJOR       // major таарсан байх
            && (typeof e?.message) === 'string'
            && (typeof e.exception) === 'object'
        )
    }

    static fromJSON<E extends IException>(plan: IExceptionPlan<E>): Exception<E> {
        return new Exception<E>(plan.message, {
            ...plan.exception,
            cause: plan.cause && Exception.fromJSON(plan.cause)
        });
    }

    private static resolve(src: any) {

        // Error type/category
        const kind = (() => {
            const k =
                src?.kind ??
                src?.category ??
                src?.errorType ??
                (typeof src?.name === 'string'
                    ? src.name.endsWith('Exception')
                        ? src.name.replace(/Exception$/, '')
                        : src.name
                    : undefined)

            return typeof k === 'string' ? k.toLowerCase() : undefined
        })();

        // Error code variations
        const cause = src?.cause && Exception.tryFrom(src?.cause);


        const code: string | number | undefined = (() => {
            if (typeof src?.code === 'number') return Number(src.code);
            if (typeof src?.code === 'string') return String(src.code);
            return undefined
        })();
        const status = src?.status ? Number(src?.status) : undefined;
        const help = src?.help ? String(src.help) : undefined;
        const instance = src?.instance ? String(src?.instance) : undefined;
        const trace_id = src?.trace_id ? String(src?.trace_id) : undefined;
        const span_id = src?.span_id ? String(src?.span_id) : undefined;
        const request_id = src?.request_id ? String(src?.request_id) : undefined;

        return { kind, cause, code, status, help, instance, trace_id, span_id, request_id };
    }

    public static tryFrom<E extends IException>(err: any, customParser?: IExceptionParser<E>): Exception<E> | undefined {
        if (err instanceof Exception) {
            return err;
        }

        if (customParser && typeof customParser.parse === 'function') {
            const parsed = customParser.parse(err);
            if (parsed instanceof Exception) return parsed;
        }

        if (err instanceof Error) {
            const { kind, cause, code, help, instance, status, trace_id, span_id, request_id } = Exception.resolve(err);
            const e = new Exception<IException>(err.message, {
                kind, cause, code, help, instance, status, trace_id, span_id, request_id,
                source: err
            });
            if (typeof err.stack === 'string') e.stack = err.stack;
            return e as Exception<E>;

        }

        if (Exception.isExceptionPlan(err)) {
            return new Exception<any>(err.message, {
                ...err.exception,
                cause: Exception.tryFrom(err.cause)
            });
        }

        if (typeof err === 'object' && (typeof err?.message) === 'string') {
            const { kind, cause, code, help, instance, status, trace_id, span_id, request_id, } = Exception.resolve(err);
            const e = new Exception<IException>(err.message, {
                kind, cause, code, help, instance, status, trace_id, span_id, request_id,
                source: err
            });
            if (typeof err.stack === 'string') e.stack = err.stack;
            return e as Exception<E>;
        }

        return undefined
    }

    public static from<E extends IException>(err: any, customParser?: IExceptionParser<E>): Exception<E> {
        const e = Exception.tryFrom(err, customParser);
        if (e instanceof Exception) return e;

        return new Exception<any>(String(err ?? "Unknown error"), {
            kind: 'unknown',
            source: err,
        })
    }
}
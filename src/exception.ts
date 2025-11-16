import { VERSION } from "./version";

export interface IException {
    /**
    * ямар төрлийн error болох тодорхойлно
    * энэ нь ямар бүтэцтэй, алдааг яаж түрслэх(UI) зэрэгийг прагамп танийлах зорилготой
    */
    kind?: string;

    /**
     * хэрэглэгчид ойлгомтой алааны товч агуулга
     */
    message: string;


    code?: string | number
    status?: number
    help?: string
    instance?: string
    trace_id?: string
};

export interface IAnyException extends IException, Record<string, any> {

}

export type IExceptionPlan<E extends IException> = {
    $exception: string;
    error: E
    cause?: IExceptionPlan<any>
};



export interface IExceptionParser<E extends IException> {
    parse(err: any): Exception<E> | false
}

export interface ExceptionOption {

    cause?: Error | Exception | unknown;

    /**
     * local only
     */
    source?: any;
}

/**
 * хөгжүүлэг өөрийн хүслээр өргөтгөх боломжтой.
 */

export class Exception<E extends IException = IAnyException> extends Error {

    readonly error: Readonly<E>;

    /**
     * Тухайн Exception өөрөө үсээгзй ямар Object-оос хөрвүүлэгдэн үүсэн бол анхдагч source -г заана 
     */
    readonly source?: any;

    constructor(opt: E & ExceptionOption) {
        super(opt.message, { cause: opt.cause });
        this.name = opt.kind
            ? `Exception/${opt.kind}`
            : (this as any).constructor?.name ?? "Exception";

        this.error = Object.freeze(Exception.clone<E>({
            ...opt,
            cause: undefined,
            source: undefined
        }));
        this.source = opt.source
    }





    toJSON(): IExceptionPlan<E> {
        const error = Exception.clone<E>({ ... this.error, message: this.message });

        let obj: IExceptionPlan<E> = {
            $exception: VERSION,
            error,
            cause: Exception.tryFrom<any>(this.cause)?.toJSON(),
        };
        return obj;
    }


    static clone<T>(obj: T): T {
        try {
            // Node 18+/modern browsers
            // @ts-ignore
            if (typeof structuredClone === "function") return structuredClone(obj);
        } catch { }
        try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
    }

    private static resolve(src: any) {


        // Error type/category
        const kind1: string | undefined =
            src?.kind ??
            src?.category ??
            src?.errorType ??
            src?.name ?? // fallback to Error name
            undefined

        const kind: string | undefined =
            (src?.kind) ??
            (src?.category) ??
            (src?.errorType) ??
            (src?.name
                ? src.name.endsWith("Exception")
                    ? src.name.replace(/Exception$/, "").toLowerCase()
                    : src?.name
                : undefined
            )
            ;

        // Error code variations
        const cause = Exception.tryFrom(src?.cause);
        const stack: string | undefined = src?.stack ? String(src?.stack) : undefined;

        const code: string | number | undefined = (() => {
            if (typeof src?.code === 'number') return Number(src.code);
            if (typeof src?.code === 'string') return String(src.code);
            return undefined
        })();
        const status: number | undefined = src?.status ? Number(src?.status) : undefined;
        const help: string | undefined = src?.help ? String(src.help) : undefined;
        const instance: string | undefined = src?.instance ? String(src?.instance) : undefined;
        const trace_id: string | undefined = src?.trace_id ? String(src?.trace_id) : undefined;

        return { kind, cause, stack, code, status, help, instance, trace_id };
    }

    static isExceptionPlan<E extends IException>(err: any): err is IExceptionPlan<E> {
        let e: IExceptionPlan<IException> = err;
        return !!(
            typeof e === 'object'
            && (typeof e?.$exception) === 'string'
            && e.$exception.split(".")[0] === VERSION.split(".")[0]       // major таарсан байх
            && e.error && typeof e?.error?.message === 'string'
        )
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
            const { kind, stack, cause, code, help, instance, status, trace_id } = Exception.resolve(err);
            const e = new Exception<IException>({
                kind, cause, code, help, instance, status, trace_id,
                message: err.message,
                source: err,
            });

            if (stack && typeof (e as any).stack === "string") (e as any).stack = stack;
            return e as Exception<any>;

        }

        if (Exception.isExceptionPlan(err)) {
            const e = new Exception<any>({
                ...(err.error),
                cause: Exception.tryFrom(err.cause)
            });
            return e;
        }

        if (typeof err === 'object' && (typeof err?.message) === 'string') {
            const { kind, stack, cause, code, help, instance, status, trace_id } = Exception.resolve(err);
            const e = new Exception<IException>({
                kind, cause, code, help, instance, status, trace_id,
                message: err.message,
                source: err
            });
            if (stack && typeof (e as any).stack === "string") (e as any).stack = stack;
            return e as Exception<any>;
        }

        return undefined
    }
    static fromJSON<E extends IException>(plan: IExceptionPlan<E>): Exception<E> {
        return new Exception<E>({
            ...plan.error,
            cause: plan.cause && Exception.fromJSON(plan.cause)
        });
    }
    public static from<E extends Exception>(err: any, customParser?: IExceptionParser<E>): Exception<E> {
        return Exception.tryFrom(err, customParser) ?? new Exception<any>({
            kind: "Unknown",
            message: String(err ?? "Unknown error"),
            source: err,
        })
    }
}
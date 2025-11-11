import { IAnyException, Exception } from "./exception";

export type ProblemDetails = {
    type?: string; title?: string; status?: number; detail?: string; instance?: string;
    code?: string | number; category?: string;
    errors?: Array<{ detail: string; pointer?: string; path?: (string | number)[]; reason?: string }>;
    trace_id?: string; retry_after?: number; meta?: Record<string, unknown>; timestamp?: string;
};

export function exceptionToProblem(e: Exception<IAnyException>): ProblemDetails {
    const err = e.error;
    return {
        type: err.help,
        title: err.kind ?? e.name,
        status: err.status,
        detail: err.message,
        instance: err.instance,
        code: err.code,
        category: err.kind,
        trace_id: err.trace_id,
    };
}

export function problemToException(p: ProblemDetails): Exception<IAnyException> {
    return new Exception<IAnyException>({
        kind: p.category ?? p.title ?? "error",
        message: p.detail ?? p.title ?? "Error",
        code: p.code,
        status: p.status,
        help: p.type,
        instance: p.instance,
        trace_id: p.trace_id,
    });
}
import { Exception } from "./exception";

export type ProblemDetails = {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    code?: string | number;
    category?: string;
    errors?: Array<{ detail: string; pointer?: string; path?: (string | number)[]; reason?: string }>;
    trace_id?: string;
    retry_after?: number;
    meta?: Record<string, unknown>;
    timestamp?: string;
};

export function exceptionToProblem(e: Exception<any>): ProblemDetails {
    const err = e.exception;
    const detail: ProblemDetails = {
        type: err.help,
        title: err.kind ?? e.name,
        status: err.status,
        detail: e.message,
        instance: err.instance,
        code: err.code,
        errors: Array.isArray(err.errors)
            ? err.errors.map((i: any) => ({
                detail: i.message ?? i.detail,
                pointer: i.pointer,
                path: i.path,
                reason: i.reason ?? i.code
            }))
            : undefined,

        category: err.kind,
        trace_id: err.trace_id,
        retry_after: err.retry_after,
        meta: err.meta,
        timestamp: err.timestamp,
    };
    return detail;
}

export function problemToException(p: ProblemDetails): Exception<any> {
    return new Exception(p.detail ?? p.title ?? "Error", {
        kind: p.category ?? p.title ?? "error",
        code: p.code,
        status: p.status,
        help: p.type,
        instance: p.instance,
        errors: Array.isArray(p.errors) ? p.errors : undefined,
        trace_id: p.trace_id,
        retry_after: p.retry_after,
        meta: p.meta,
        timestamp: p.timestamp,
    });
}
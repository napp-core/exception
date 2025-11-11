export function httpStatusByKind(kind: string): number | undefined {

    switch ((kind || '').toLowerCase()) {
        case 'validation': return 400;
        case 'authentication': return 401;
        case 'authorization': return 403;
        case 'notfound': return 404;
        case 'conflict': return 409;
        case 'timeout': return 408;
        case 'toomanyrequests': return 429;
        case 'serviceunavailable': return 503;
        case 'internal': return 500;
        case 'unsupported': return 415;
        case 'database': return 500; // Database errors are often internal
        case 'network': return 502; // Network errors can be considered as bad gateway
        case 'unknown': return 500; // Unknown errors are often internal
    }

    return undefined;
}
# @napp/exception

Lightweight, structured exceptions for Node.js and browsers with deterministic JSON serialization and RFC 7807 Problem Details mapping.

## Features

- Structured error metadata via `Exception<E>` (typed `exception` payload)
- Cause chaining via native `Error.cause`
- Deterministic `toJSON()` / `fromJSON()` for safe transport over HTTP/logs/queues
- Helpers for mapping `kind` to an HTTP status code
- Conversion helpers for RFC 7807-like `ProblemDetails`
- Built-in exception types: `ValidationException`, `AuthenticationException`, `AuthorizationException`

## Install

```bash
npm i @napp/exception
```

Requirements: Node.js 20+

### Module formats

This package is ESM-first, but also ships a CommonJS build via `exports`.

```ts
import { Exception } from "@napp/exception";
```

```js
const { Exception } = require("@napp/exception");
```

## Quick start

```ts
import {
  Exception,
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  exceptionToProblem,
  problemToException,
  httpStatusByKind,
} from "@napp/exception";

// 1) Create and throw
throw new ValidationException("name is required", {
  code: "VALIDATION",
  status: 400,
  errors: [{ path: "name", message: "Required" }],
});

// 2) Normalize unknown input to Exception
function toException(err: unknown) {
  return Exception.from(err);
}

// 3) Cause chain
const inner = new Exception("bad name", { kind: "validation", status: 400 });
const outer = new Exception("access denied", {
  kind: "authorization",
  status: 403,
  cause: inner,
});

// 4) Serialize and restore (wire-safe JSON)
const plan = outer.toJSON();
const restored = Exception.fromJSON(plan);

// 5) ProblemDetails (RFC 7807 style) conversion
const problem = exceptionToProblem(restored);
const backToEx = problemToException(problem);

// 6) Map kind -> HTTP status
const status = restored.exception.status ?? httpStatusByKind(restored.exception.kind ?? "") ?? 500;
```

## Serialization format

`Exception#toJSON()` returns an `IExceptionPlan` that can be sent over the wire and restored with `Exception.fromJSON()`.

```json
{
  "$exception": "<version>",
  "message": "access denied",
  "exception": { "kind": "authorization", "status": 403 },
  "cause": { "...": "..." }
}
```

- `$exception` carries the library version; `Exception.isExceptionPlan()` requires a matching major version.
- Only `message`, `exception`, and the `cause` chain are included (stack traces are not serialized).
- Keep `exception` values JSON-compatible if you plan to call `JSON.stringify()` on the plan.

## API

### Core

- `interface IException`
  - Common fields: `kind?`, `code?`, `status?`, `help?`, `instance?`, `trace_id?`, `span_id?`, `request_id?`
  - You can extend it with additional fields (they will be included in `exception`)
- `class Exception<E extends IException = IException> extends Error`
  - `readonly exception: E` immutable metadata payload
  - `toJSON(): IExceptionPlan<E>`
  - `static fromJSON(plan: IExceptionPlan<E>): Exception<E>`
  - `static from(err: unknown, parser?: IExceptionParser<E>): Exception<E>`
  - `static tryFrom(err: unknown, parser?: IExceptionParser<E>): Exception<E> | undefined`
  - `static isExceptionPlan(x: unknown): x is IExceptionPlan<E>`

### Built-in exceptions

- `ValidationException` (`EValidation`, `EValidationItem`)
  - `errors?: Array<{ path?: string; reason?: string; message: string }>`
- `AuthenticationException`
- `AuthorizationException` (`EAuthorization`)
  - `required: string`

### Helpers

- `httpStatusByKind(kind: string): number | undefined`

### Problem Details (RFC 7807 style)

- `type ProblemDetails`
- `exceptionToProblem(e: Exception): ProblemDetails`
- `problemToException(p: ProblemDetails): Exception`

## Usage patterns

### Express-style error handler

```ts
import type { Request, Response, NextFunction } from "express";
import { Exception, exceptionToProblem, httpStatusByKind } from "@napp/exception";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const ex = Exception.from(err);
  const status = ex.exception.status ?? httpStatusByKind(ex.exception.kind ?? "") ?? 500;
  res.status(status).json(exceptionToProblem(ex));
}
```

### Authentication / authorization

```ts
import { AuthenticationException, AuthorizationException } from "@napp/exception";

throw new AuthenticationException("login required", { status: 401 });
throw new AuthorizationException("access denied", { status: 403, required: "admin" });
```

## Notes

- `Exception.name` becomes `Exception/<kind>` when `kind` is present; otherwise it stays `Exception`.
- `exception` metadata is cloned and frozen at construction time.

## Development

- Build: `npm run build`
- Test: `npm test`

## License

ISC

# @napp/exception — Exception Library / Алдааны сан

Lightweight, structured exceptions for Node/Browser with JSON-safe serialization.
Node болон Browser-д зориулсан, JSON-д найдвартай сериалчилдаг, хөнгөн exception сан.

— Works great across process boundaries (HTTP, workers, logs).
— Процесс хооронд (HTTP, worker, log) дамжуулахад найдвартай.

## Features / Онцлог
- Typed core `Exception<E>` with immutable `error` data
  - Төрөлжсөн `Exception<E>` ба immutable `error` объект
- Cause chaining with native `Error.cause`
  - `cause` ашиглан алдааны гинжин холбоос дэмжинэ
- Deterministic `toJSON()` / `fromJSON()` for wire-safe transport
  - `toJSON()` / `fromJSON()` нь найдвартай сериалчлал/сэргээх
- Helpers for HTTP status mapping and RFC7807 ProblemDetails
  - HTTP статус тааруулах, RFC7807 ProblemDetails хөрвүүлэгчтэй
- Built-in flavors: Validation, Authentication, Authorization
  - Суурь бэлэн төрөл: Validation, Authentication, Authorization

## Install / Суурилуулалт

```bash
npm i @napp/exception
```

Requires Node 20+.
Node 20+ шаардлагатай.

## Quick Start / Түргэн эхлэх

```ts
import {
  Exception,
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  exceptionToProblem,
  problemToException,
  httpStatusByKind,
} from '@napp/exception'

// 1) Create and throw / Үүсгээд шидэх
throw new ValidationException({
  message: 'name is required',
  code: 'VALIDATION',
  status: 400,
  // errors: [{ path: 'name', message: 'Required' }]
})

// 2) Wrap unknown errors / Үл мэдэгдэх алдааг нэг хэлбэрт оруулах
function toException(err: unknown) {
  return Exception.from(err)
}

// 3) Cause chain / алдааны гинж
const inner = new Exception({ kind: 'validation', message: 'bad name', status: 400 })
const outer = new Exception({ kind: 'permission', message: 'access denied', status: 403, cause: inner })

// 4) Serialize and restore / Сериалчилж дамжуулаад сэргээх
const plan = outer.toJSON()              // send over HTTP, log, queue
const restored = Exception.fromJSON(plan) // receive and restore

// 5) ProblemDetails (RFC7807) conversion / RFC7807 хөрвүүлэлт
const problem = exceptionToProblem(outer)
const backToEx = problemToException(problem)

// 6) Map kind to HTTP status / kind -> HTTP статус
const status = httpStatusByKind('validation') // 400
```

## API Overview / API тойм

### Core Types / Суурь төрлүүд

- `interface IException`
  - Common fields: `kind?`, `message`, `code?`, `status?`, `help?`, `instance?`, `trace_id?`
  - Нийтлэг талбарууд: `kind?`, `message`, `code?`, `status?`, `help?`, `instance?`, `trace_id?`

- `class Exception<E extends IException = IAnyException> extends Error`
  - `constructor(opt: E & ExceptionOption)` — creates exception with optional `cause` and local-only `source`.
    - `cause` нь гинжин холбоос үүсгэнэ, `source` нь локал хэрэглээ (JSON-д орохгүй)
  - `readonly error: Readonly<E>` — immutable error payload.
  - `toJSON(): IExceptionPlan<E>` — deterministic plan for transport.
  - `static fromJSON(plan)` — restore exception (no `source`).
  - `static from(err, parser?)` — normalize unknown input to `Exception`.
  - `static tryFrom(err, parser?)` — like `from` but returns `undefined` on failure.
  - `static isExceptionPlan(x)` — guard for JSON shape.
  - `static clone<T>(x): T` — structured clone fallback.

- `interface ExceptionOption`
  - `cause?: Error | Exception | unknown`
  - `source?: any` (local only, not serialized)

- `interface IExceptionPlan<E>`
  - Wire format for `toJSON()`/`fromJSON()`; contains `$exception`, `error`, `cause`.

- `interface IExceptionParser<E>`
  - Custom parser hook for `from/tryFrom`.

### Built‑ins / Бэлэн ангиллууд

- `ValidationException` with `EValidation` and `EValidationItem`
  - `errors?: Array<{ path?: string; reason?: string; message: string }>`
- `AuthenticationException` with `EAuthentication`
- `AuthorizationException` with `EAuthorization { required: string }`

### Helper / Туслагч

- `httpStatusByKind(kind: string): number | undefined`
  - Maps common kinds: `validation→400`, `authentication→401`, `authorization→403`, `notfound→404`, `conflict→409`, `timeout→408`, `toomanyrequests→429`, `serviceunavailable→503`, `internal→500`, `unsupported→415`, `database→500`, `network→502`, `unknown→500`.

### ProblemDetails / RFC7807

- `type ProblemDetails`
- `exceptionToProblem(e: Exception) => ProblemDetails`
- `problemToException(p: ProblemDetails) => Exception`

## Usage Patterns / Хэрэглэх жишээ

### Express-style handler / Express төстэй handler

```ts
import type { Request, Response } from 'express'
import { Exception, exceptionToProblem, httpStatusByKind } from '@napp/exception'

export async function handler(req: Request, res: Response) {
  try {
    // ... your logic
  } catch (err) {
    const ex = Exception.from(err)
    const problem = exceptionToProblem(ex)
    const status = ex.error.status ?? httpStatusByKind(ex.error.kind ?? '') ?? 500
    res.status(status).json(problem)
  }
}
```

### Preserve cause chain / Шалтгааны гинж хадгалах

```ts
try {
  doWork()
} catch (e) {
  throw new Exception({ kind: 'internal', message: 'processing failed', cause: e, status: 500 })
}
```

### Typed validation payload / Төрөлтэй validation мэдээлэл

```ts
throw new ValidationException({
  message: 'Invalid input',
  status: 400,
  errors: [
    { path: 'email', message: 'Invalid format' },
    { path: 'age', reason: 'min', message: 'Must be >= 18' },
  ],
})
```

## Notes / Тэмдэглэл
- `error` is immutable and safe to expose. `source` is local-only.
  - `error` нь immutable, гадна руу өгөхөд аюулгүй. `source` нь зөвхөн локал.
- `name` becomes `Exception/<kind>` if `kind` is present; else `Exception`.
  - `kind` байвал `name` нь `Exception/<kind>` хэлбэртэй, үгүй бол `Exception`.
- `VERSION` embeds major version in JSON plan to keep compatibility.
  - JSON plan дотор major version хадгалж нийцтэй байдлыг хангана.

## Development / Хөгжүүлэлт
- Build: `npm run build` (uses `tsup`)
- Test: `npm test` (Node test runner + tsx)

## License / Лиценз
ISC


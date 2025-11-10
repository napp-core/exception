# common exception Library

A lightweight and expressive exception system for structured error handling in both server and client contexts.

**Товч тайлбар**:  
Энэхүү сан нь алдааг `type`, `code`, `cause`, `httpStatus`, `isOperational`, `data` зэргээр бүтэцлэн илэрхийлж, олон шатлалт алдааны мэдээллийг илүү ойлгомжтой болгоход зориулагдсан.

---

## Features / Онцлог

- Strictly-typed structured error object (`Exception`)
- Multilevel `cause` chaining
- Optional `data`, `source`, `httpStatus`, `isOperational` flags
- Centralized parsing with `Exception.from(...)`
- Interoperable with native `Error`, external errors, or any object

---

## Installation

```bash
npm install @napp/exception
```








# basic usage Example / Ашиглах жишээ

``` typescript
import { Exception } from '@napp/exception';

throw new Exception('Post not found', {
  type: 'NotFound',
  code: 'POST_404',
  isOperational: true,
});

...

try {
  doAction();
} catch (err) {
  throw new Exception('Failed to complete operation', {
    type: 'ServiceUnavailable',
    cause: err,
    data: { operation: 'doThing' },
  });
}

```



## Use Case: Structured error transport between server and client
Серверээс JSON алдаа буцааж, client талд Exception-р сэргээх

``` typescript
// server side

// Example: In tRPC / Express / GraphQL resolver
import { Exception } from 'your-exception-library';

if (await postExists(title)) {
  throw new Exception('Title already exists', {
    type: 'Conflict',
    code: 'TITLE_TAKEN',
    data: { id: 'abc123' },
    isOperational: true,
  });
}

// serialize for network transport
const json = err.toJSON(); // IException


// client side
// errJson could be from HTTP response, tRPC errorFormatter, etc.
const err = Exception.from(errJson);

console.log(err.message); // "Title already exists"
console.log(err.type);    // "Conflict"
console.log(err.code);    // "TITLE_TAKEN"
console.log(err.data);    // { id: 'abc123' }


```
✅ Exception.from(json) нь:

- Серверийн сериализ болсон JSON-оос Exception объектыг дахин сэргээдэг
- stack болон source мэдээллийг серверээс задруулахгүй
- cause-г гүнзгий сэргээх боломжтой (recursively nested)

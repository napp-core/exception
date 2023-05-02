# common exception

javascript error common library. basic error library

- error -> json string -> error
- customer error


# basic error

``` typescript

let err = new NotfoundException("message").setCode('err.test.001');
let jsonStr = JSON.stringify(err);
// obj output
//
// {
//      "ref": "exception",
//      "message": "message",
//      "code" : "err.test.001"
// }

let nErr = Exception.from(JSON.parse(jsonStr));

assert.ok(nErr instanceof Error, 'nErr instanceof Error')
assert.ok(nErr instanceof Exception, 'nErr instanceof Exception')
assert.ok(nErr instanceof NotfoundException, 'nErr instanceof NotfoundException')
assert.equal(nErr.message,'message')
assert.equal(nErr.message, err.message)
assert.equal(nErr.code, 'err.test.001')
assert.equal(nErr.code, err.code)

```

# avilable error

``` typescript

new Exception('error message');
new AuthenticationException('error message');
new AuthorizationException('error message');
new NetworkException('error message');
new NotfoundException('error message');
new NotSupportedException('error message');
new ServerException('error message');
new TimeoutException('error message');
new ValidationException('error message');

```



# custom error

``` typescript
class MyError extends Exception {

    other: string;
    constructor(m: string, other: string) {
        super(m);
        this.other = other;
    }
}

// json to error convertor
Exception.register(MyError, (src) => {
    return new MyError(src.message, src.other);
})

let obj = new MyError('msg1', 'other1');
// obj output
//
// {
//      ref: "Exception.MyError",
//      message: "msg1",
//      other : "other1"
// }


let e1 = Exception.from(obj);

if (e1 instanceof MyError) {
    assert.equal("Exception.MyError", e1.ref)
    assert.equal("msg1", e1.message)
    assert.equal("other1", e1.other)
} else {
    throw new Error('not working convert');
}

```
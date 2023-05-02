# common exception

javascript error common library. basic error library

- error -> json string -> error
- customer error


# basic error

``` typescript

let err = new Exception('message');

let obj = err.toPlan();
// obj output
//
// {
//      type: "Exception",
//      message: "message"
// }

let errStr = JSON.stringify(err)
// errStr output
//
// {
//      "type": "Exception",
//      "message": "message"
// }

```


# avilable error

``` typescript

let err = new Exception('err1','msg1');
// err = {type: "err1", message: "msg1"}

let err1 = new NotFoundException('message1');
// err2 = {type: "notfound", message: "message1"}

let err2 = new NotSupportedException('message2')
// err2 = {type: "notsupported", message: "message2"}

let err31 = new AuthenticationException();
// err31 = {type: "authentication", message: "requared authentication"}

let err32 = new AuthenticationException("message32");
// err32 = {type: "authentication", message: "message32"}

let err4 = new AuthorizationException('message4');
// err4 = {type: "authorization", message: "message4"}

let err5 = new ServerException("message5");
// err5 = {type: "server", message: "message5"}

let err6 = new ValidationException("message6");
// err6 = {type: "validation", message: "message6"}

```



# custom error

``` typescript
class MyError extends Exception {

    other: string;
    constructor(m: string, other: string) {
        super(m, "MyError");
        this.other = other;
    }
}
Exception.register<MyError>("MyError", (src) => {
    return new MyError(src.message, src.other);
})

let obj = new MyError('msg1', 'other1').toPlan();
// obj output
//
// {
//      type: "MyError",
//      message: "msg1",
//      other : "other1"
// }


let e1 = Exception.from(obj);



if (e1 instanceof MyError) {
    assert.equal("MyError", e1.type)
    assert.equal("custom1", e1.message)
    assert.equal("val1", e1.other)
} else {
    throw new Error('not working convert');
}

```
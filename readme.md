# common exception

javascript error common library. basic error library

- error -> json string -> error
- error message template



# basic error

``` typescript

    let err = new Exception("message", {
        name: 'err.test.001'
    })

    let jsonStr = JSON.stringify(err);

    let nErr = Exception.from(JSON.parse(jsonStr));


    assert.ok(nErr instanceof Exception, 'nErr instanceof Exception')
    assert.equal(nErr.message, 'message')
    assert.equal(nErr.message, err.message)

    assert.equal(nErr.name, 'err.test.001')
    assert.equal(nErr.name, err.name)

```


# use cause 

``` typescript

    try {
        throw new Exception('login need', { name: 'src' })
    } catch (error) {

        let err = new Exception('l2').setCause(Exception.from(error))


        assert.equal(err.cause?.name, 'src');
        assert.equal(err.cause?.message, 'login need');

        let json = JSON.stringify(err);
        let nerr = Exception.from(JSON.parse(json));

        assert.equal(nerr.name, ExceptionNames.Exception);
        assert.ok(nerr instanceof Exception, 'jo instanceof Exception')


        let loginerr = Exception.from(nerr.cause);

        assert.equal(loginerr.message, 'login need')
        assert.ok(loginerr instanceof Exception, 'loginerr instanceof Exception')

        assert.equal(loginerr.name, 'src');
    }

```

# error message template

``` typescript

    let e = new Exception(["hi ${a}", { a: 'farcek' }]);
    let e1 = new Exception(["hi ${a}", { a: 'saraa' }]);
    let e2 = new Exception(["hi ${b}", { a: 'b is miss' }]);

    assert.equal(e.toMessage(), 'hi farcek')
    assert.equal(e1.toMessage(), 'hi saraa')
    assert.equal(e2.toMessage(), 'hi ${b}')

```


import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import { AuthenticationException, Exception, NotfoundException, ValidationException } from "../src";
import { MyError } from './myerror';


@suite
class JsonTest {
    @test
    async basic() {

        let e = new Exception("message");
        let m = new MyError("message", ' 11');


        let jo = JSON.parse(JSON.stringify(e));
        let jm = JSON.parse(JSON.stringify(m));


        assert.equal(e.message, jo.message)
        assert.equal(m.message, jm.message)
        assert.equal(m.other, jm.other)


    }

    @test
    async toPlan() {
        let e1 = new NotfoundException('test');

        let s = e1.toPlan();
        assert.equal(s.message, 'test')
        assert.equal(s.ref, 'notfound')


        let e2 = new MyError("msg1", 'o1');

        let o2 = e2.toPlan();
        assert.equal(o2.message, 'msg1')
        assert.equal(o2.other, 'o1')
        assert.equal(o2.ref, 'Exception.MyError')

    }

    @test
    async convert() {

        let e = new NotfoundException("message").setHelp('h1');


        let json = JSON.stringify(e);

        let jo = Exception.from(JSON.parse(json));




        assert.ok(jo instanceof Error, 'jo instanceof Error')
        assert.ok(jo instanceof Exception, 'jo instanceof Exception')
        assert.ok(jo instanceof ValidationException, 'jo instanceof ValidationException')
        assert.ok(jo instanceof NotfoundException, 'jo instanceof NotfoundException')
        assert.equal(e.message, jo.message)
        assert.equal(e.help, jo.help)


    }


    @test
    async convertInner() {

        try {
            throw new AuthenticationException('login need')
        } catch (error) {

            let err = new ValidationException('l2').addException(Exception.from(error))

            let json = JSON.stringify(err);
            let nerr = Exception.from(JSON.parse(json));


            assert.ok(nerr instanceof ValidationException, 'jo instanceof NotfoundException')
            assert.ok(nerr.exceptions?.length === 1, 'exceptions?.length === 1');

            if(nerr.exceptions && nerr.exceptions[0]) {
                let loginerr = nerr.exceptions[0];

                assert.equal(loginerr.message, 'login need')
                assert.ok(loginerr instanceof AuthenticationException, 'loginerr instanceof AuthenticationException')
            }else {
                assert.fail("nerr.exceptions && nerr.exceptions[0]  === false")
            }
            

           



        }






    }


}


import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import {  Exception, } from "../src";




@suite
class JsonTest {
    @test
    async basic() {
        //Exception.__to_json_have_stack = true
        let err = new Exception("message")
            .setName('n1')



        let jo = JSON.parse(JSON.stringify(err));



        assert.equal(err.message, "message")
        assert.equal(err.message, jo.message)
        assert.equal(err.name, "n1")
        assert.equal(err.name, jo.name)
    



    }

    @test
    async toPlan() {
        let e1 = new Exception('test').setName("notfound");

        let s = e1.toPlan();
        assert.equal(s.message, 'test')
        assert.equal(s.name, 'notfound')


        let e2 = new Exception("msg1", { name: 'o1' });

        let o2 = e2.toPlan();
        assert.equal(o2.message, 'msg1')
        assert.equal(o2.name, 'o1')


    }

    @test
    async convert() {

        let err = new Exception("message", {
            name: 'err.test.001',
            cause: new Exception('nested error')
        })

        let jsonStr = JSON.stringify(err);

        let nErr = Exception.from(JSON.parse(jsonStr));


        assert.ok(nErr instanceof Exception, 'nErr instanceof Exception')
        assert.equal(nErr.message, 'message')
        assert.equal(nErr.message, err.message)

        assert.equal(nErr.name, 'err.test.001')
        assert.equal(nErr.name, err.name)

        assert.equal(nErr.cause?.message, 'nested error')
        assert.equal(nErr.cause?.message, err.cause?.message)

    }


    @test
    async convertInner() {

        try {
            throw new Exception('login need', { name: 'src' })
        } catch (error) {

            let err = new Exception('l2').setCause(Exception.from(error))


            assert.equal(err.cause?.name, 'src');
            assert.equal(err.cause?.message, 'login need');

            let json = JSON.stringify(err);
            let nerr = Exception.from(JSON.parse(json));

            assert.equal(nerr.name, "exception");
            assert.ok(nerr instanceof Exception, 'jo instanceof Exception')


            let loginerr = Exception.from(nerr.cause);

            assert.equal(loginerr.message, 'login need')
            assert.ok(loginerr instanceof Exception, 'loginerr instanceof AuthenticationException')

            assert.equal(loginerr.name, 'src');
        }

    }


}


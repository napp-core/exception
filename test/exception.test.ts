import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import { Exception, NotfoundException, ValidationException } from "../src";


@suite
class ExceptionAction {
    @test
    async basic() {

        let e = new Exception("message");
        assert.equal(e.message, "message")
        assert.equal(e.ref, "exception")
    }

    @test
    async extend() {

        let err4 = new NotfoundException('e3')

        assert.ok(err4 instanceof NotfoundException, 'no extends of NotfoundException')
        assert.ok(err4 instanceof ValidationException, 'no extends of ValidationException')
        assert.ok(err4 instanceof Exception, 'no extends of Exception')
        assert.ok(err4 instanceof Error, 'no extends of Error')

    }

    @test
    async attr() {

        let e = new Exception("test message")
            .setHelp('help1')
            .setStatus(404)
            .setTitle('title1')
            
            .setTraceid('123');

        assert.equal(e.message, "test message")
        assert.equal(e.ref, "exception")
        assert.equal(e.help, "help1")
        assert.equal(e.status, 404)
        assert.equal(e.title, 'title1')
        
        assert.equal(e.traceid, '123')

    }


    @test
    async basicConver1() {

        let e = new Exception("Err1");
        let str = JSON.stringify(e);
        let e1 = Exception.from(JSON.parse(str));
        assert.equal(e.message, e1.message)
        assert.equal(e.ref, e1.ref)

    }
    

    @test
    async status() {

        let e1 = new ValidationException("test 1");
        let e2 = new NotfoundException("test 2");



        assert.equal(e1.message, "test 1")
        assert.equal(e2.message, "test 2")
        assert.equal(e1.status, 400)
        assert.equal(e2.status, 404)

    }
}


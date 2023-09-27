import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import { Exception, NotfoundException, ValidationException } from "../src";
import { ExceptionNames } from '../src/names';


@suite
class ExceptionAction {
    @test
    async basic() {

        let e = new Exception("message");
        assert.equal(e.message, "message")
        assert.equal(e.name, "exception")
    }

    @test
    async extend() {

        let err4 = new NotfoundException('e3')

        assert.ok(err4 instanceof NotfoundException, 'no extends of NotfoundException')
        assert.ok(err4 instanceof Exception, 'no extends of Exception')
        assert.ok(err4 instanceof Error, 'no extends of Error')
        

    }

    @test
    async attr() {

        let e = new Exception("test message")
            .setName('err1')





        assert.equal(e.message, "test message")
        assert.equal(e.name, "err1")

    }


    @test
    async basicConver1() {

        let e = new Exception("Err1", {name:'err1'});
        let str = JSON.stringify(e);
        let e1 = Exception.from(JSON.parse(str));
        assert.equal(e.message, e1.message)
        assert.equal(e.name, e1.name)

    }


    @test
    async status() {

        let e1 = new ValidationException("test 1");
        let e2 = new NotfoundException("test 2");



        assert.equal(e1.message, "test 1")
        assert.equal(e2.message, "test 2")
        assert.equal(e1.name, ExceptionNames.Validation)
        assert.equal(e2.name, ExceptionNames.Notfound)

    }
}


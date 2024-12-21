import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import { Exception, } from "../src";



@suite
class ExceptionAction {
    @test
    async basic() {

        let e = new Exception("message");
        assert.equal(e.message, "message")
        assert.equal(e.name, "exception")
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

        let e1 = new Exception("test 1",  {name : "e1"});
        let e2 = new Exception("test 2",  {name : "e2"});



        assert.equal(e1.message, "test 1")
        assert.equal(e2.message, "test 2")
        assert.equal(e1.name, "e1")
        assert.equal(e2.name, "e2")

    }
}


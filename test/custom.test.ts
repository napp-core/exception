import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import { Exception } from "../src";
import { MyError } from './myerror';





@suite
class CustomExceptionTest {
    @test
    async basic() {
        try {
            throw new MyError("custom1", "val1")
        } catch (error) {
            assert.ok(error instanceof Error, "instanceof Error")
            assert.ok(error instanceof MyError, "instanceof MyError")

            

            if (error instanceof MyError) {
                assert.equal("Exception.MyError", error.ref)
                assert.equal("custom1", error.message)
                assert.equal("val1", error.other)
            } else {
                assert.fail("not  instanceof MyError")
            }

        }
    }

    @test
    async convert() {
        let err = new MyError("custom1", "val1");

        let str = JSON.stringify(err);
        let obj = JSON.parse(str);
        let e1 = Exception.from(obj);


        if (e1 instanceof MyError) {
            assert.equal( 'Exception.MyError', e1.ref)
            assert.equal("custom1", e1.message)
            assert.equal("val1", e1.other)
        } else {
            throw new Error('not working convert');
        }


    }


}


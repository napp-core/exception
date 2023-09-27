import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import assert from "assert";
import { Exception } from "../src";






@suite
class CustomExceptionTest {
    @test
    async basic() {
        try {
            throw new Exception("custom1", {name:"val1"})
        } catch (error) {
            
            assert.ok(error instanceof Exception, "instanceof Exception")

            

            if (error instanceof Exception) {
                assert.equal("val1", error.name)
                assert.equal("custom1", error.message)                
            } else {
                assert.fail("not  instanceof MyError")
            }

        }
    }

    @test
    async convert() {
        let err = new Exception("custom1", {name:"val1"});

        let str = JSON.stringify(err);
        let obj = JSON.parse(str);
        let e1 = Exception.from(obj);


        if (e1 instanceof Exception) {
            assert.equal( 'val1', e1.name)
            assert.equal("custom1", e1.message)            
        } else {
            throw new Error('not working convert');
        }


    }


}


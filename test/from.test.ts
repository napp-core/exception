import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";
import assert from "assert";
import { Exception } from "../src";



@suite
class FromTest {
    @test
    async basic1() {

        let err1 = Exception.from(new Exception('err1', {name:'a.b'}));


        assert.equal(err1.name, 'a.b')
        assert.equal(err1.message, 'err1')

    }

    @test
    async basic2() {

        let err = Exception.from(new Error("msg1"));


        assert.equal(err.name, 'Error')
        assert.equal(err.message, 'msg1')

    }

    @test
    async basic3() {

        {
            let err = Exception.from({ name: 'ab', message: 'm1' });
            assert.equal(err.name, 'ab')
            assert.equal(err.message, 'm1')
        }

        {
            let err = Exception.from({ name: 'cc', error: 'ee' });
            assert.equal(err.name, 'cc')
            assert.equal(err.message, 'ee')
        }

        {
            let err = Exception.from({ error: 'ee' });
            assert.equal(err.name, 'exception')
            assert.equal(err.message, 'ee')
        }

        {
            let err = Exception.from({ foo: 'ee' });
            assert.equal(err.name, 'exception')
            assert.equal(err.message, 'Unknown error')
            assert.deepEqual(err.cause, { foo: 'ee' })
        }
    }

}


import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";
import assert from "assert";
import { Exception } from "../src";



@suite
class DataTest {
    @test
    async basic() {

        let e = new Exception(["message1", { a: 1 }]).setName('err1');


        assert.equal(e.name, 'err1')
        assert.equal(e.message, 'message1')
        assert.deepEqual(e.data, { a: 1 })


    }

    @test
    async json() {

        let e = new Exception(["message1", { a: 1 }]).setName('err1');

        let j = JSON.parse(JSON.stringify(e))

        assert.equal(j.name, 'err1')
        assert.equal(j.message, 'message1')
        assert.deepEqual(j.data, { a: 1 })
    }


    @test
    async conver() {

        let e = new Exception(["message1", { a: 1 }]).setName('err1');

        let j = JSON.parse(JSON.stringify(e));

        let e1 = Exception.from(j)

        assert.equal(e1.name, 'err1')
        assert.equal(e1.message, 'message1')
        assert.deepEqual(e1.data, { a: 1 })
    }

    @test
    async message() {

        let e = new Exception(["hi ${a}", { a: 'farcek' }]);
        let e1 = new Exception(["hi ${a}", { a: 'saraa' }]);
        let e2 = new Exception(["hi ${b}", { a: 'b is miss' }]);

        assert.equal(e.toMessage(), 'hi farcek')
        assert.equal(e1.toMessage(), 'hi saraa')
        assert.equal(e2.toMessage(), 'hi ${b}')

    }

}


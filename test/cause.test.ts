import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";
import assert from "assert";
import { Exception } from "../src";



@suite
class CauseTest {
    @test
    async toPlan() {

        let err1 = new Exception("message1").setName('err1');
        let err2 = new Exception("message2").setName('err2').setCause(err1);
        let err3 = new Exception("message3").setName('err3').setCause(err2);


        let o = err3.toPlan();

        assert.equal(o.name, 'err3')
        assert.equal(o.cause?.name, 'err2')
        assert.equal(o.cause?.cause?.name, 'err1')


    }

    @test
    async from() {

        let err1 = new Exception("message1").setName('err1');
        let err2 = new Exception("message2").setName('err2').setCause(err1);
        let err3 = new Exception("message3").setName('err3').setCause(err2);


        let json = JSON.parse(JSON.stringify(err3));

        let e = Exception.from(json);

        assert.equal(e.name, 'err3')
        assert.equal(e.message, 'message3')
        assert.equal(e.cause?.name, 'err2')
        assert.equal(e.cause?.message, 'message2')
        assert.equal(e.cause?.cause?.name, 'err1')
        assert.equal(e.cause?.cause?.message, 'message1')
    }

    @test
    async from1() {

        let err1 = new Exception("message1").setName('err1');
        let err2 = new Exception("message2").setName('err2').setCause(err1);
        let err3 = new Exception("message3").setName('err3').setCause(err2);


        let json = JSON.parse(JSON.stringify(err3));

        let e3 = Exception.from(json);
        let e2 = Exception.from(e3.cause);
        let e1 = Exception.from(e2.cause);

        assert.equal(e3.name, 'err3')
        assert.equal(e3.message, 'message3')
        assert.equal(e2.name, 'err2')
        assert.equal(e2.message, 'message2')
        assert.equal(e1.name, 'err1')
        assert.equal(e1.message, 'message1')
    }


}


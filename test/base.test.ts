import 'reflect-metadata';
import { suite, test } from "@testdeck/mocha";

import { expect } from 'chai';
import {  Exception,  ExceptionType } from "../src";




@suite
class BaseTest {
    @test
    'should create an exception with only message'() {
        const err = new Exception('Simple error');
        expect(err.message).to.equal('Simple error');
        expect(err.type).to.be.undefined;
    }

    @test
    'should accept type and code'() {
        const err = new Exception('Validation failed', {
            type: 'Validation',
            code: 'VAL001',
        });
        expect(err.type).to.equal('Validation');
        expect(err.code).to.equal('VAL001');
    }

    @test
    'should support custom fields: data, isOperational, httpStatus'() {
        const err = new Exception('DB failed', {
            type: 'Database',
            data: { retry: true },
            isOperational: true,
            httpStatus: 500,
        });
        expect(err.data).to.deep.equal({ retry: true });
        expect(err.isOperational).to.be.true;
        expect(err.httpStatus).to.equal(500);
    }

    @test
    'should nest cause Exception'() {
        const root = new Exception('Root cause', { type: 'Internal' });
        const wrapped = new Exception('Wrapper', { cause: root });
        expect(wrapped.cause).to.be.instanceOf(Exception);
        expect(wrapped.cause?.message).to.equal('Root cause');
    }

    @test
    'should merge common error formats'() {
        const nodeError = new Error('Node error');
        (nodeError as any).code = 'ECONNRESET';
        const ex = Exception.from(nodeError);
        expect(ex.code).to.equal('ECONNRESET');
        expect(ex.message).to.equal('Node error');
    }

    @test
    'should parse unknown errors'() {
        const err = Exception.from({ unexpected: true });
        expect(err.message).to.equal('Unknown error');
        expect(err.type).to.equal('Unknown');
    }

    @test
    'should stringify to JSON cleanly'() {
        const err = new Exception('Broken', {
            code: 'BROKEN',
            data: { detail: 'deep' },
        });
        const json = err.toJSON();
        expect(json).to.deep.include({
            message: 'Broken',
            code: 'BROKEN',
            data: { detail: 'deep' },
        });
    }

    @test
    'httpStatusByType should return correct status codes'() {
        expect(Exception.httpStatusByType('Validation')).to.equal(400);
        expect(Exception.httpStatusByType('Authentication')).to.equal(401);
        expect(Exception.httpStatusByType('Unknown')).to.equal(500);
        expect(Exception.httpStatusByType('CustomType' as ExceptionType)).to.equal(0);
    }


}


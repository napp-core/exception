import { describe, it } from "node:test"
import assert from "node:assert/strict"


import { Exception, ExceptionType } from "../src";


describe("BaseTest", () => {
    it('should create an exception with only message', () => {
        const err = new Exception('Simple error');
        assert.equal(err.message, 'Simple error');
        assert.equal(err.type, undefined);
    })
    it('hould accept type and code', () => {
        const err = new Exception('Validation failed', {
            type: 'Validation',
            code: 'VAL001',
        });
        assert.equal(err.type, 'Validation');
        assert.equal(err.code, 'VAL001');
    })





    it('should support custom fields: data, isOperational, httpStatus', () => {
        const err = new Exception('DB failed', {
            type: 'Database',
            data: { retry: true },
            isOperational: true,
            httpStatus: 500,
        });
        assert.deepEqual(err.data, { retry: true });
        assert.equal(err.isOperational, true);
        assert.equal(err.httpStatus, 500);
    })


    it('should nest cause Exception', () => {
        const root = new Exception('Root cause', { type: 'Internal' });
        const wrapped = new Exception('Wrapper', { cause: root });
        assert.equal(wrapped.cause instanceof Exception, true);
        assert.equal(wrapped.cause?.message, 'Root cause');
    })


    it('should merge common error formats', () => {
        const nodeError = new Error('Node error');
        (nodeError as any).code = 'ECONNRESET';
        const ex = Exception.from(nodeError);
        assert.equal(ex.code, 'ECONNRESET');
        assert.equal(ex.message, 'Node error');
    })

    it('should parse unknown errors', () => {
        const err = Exception.from({ unexpected: true });
        assert.equal(err.message, 'Unknown error');
        assert.equal(err.type, 'Unknown');
    })

    it('should stringify to JSON cleanly', () => {
        const err = new Exception('Broken', {
            code: 'BROKEN',
            data: { detail: 'deep' },
        });
        const json = err.toJSON();

        assert.equal(json.message, 'Broken');
        assert.equal(json.code, 'BROKEN');
        assert.deepEqual(json.data, { detail: 'deep' });
    })

    it('httpStatusByType should return correct status codes', () => {
        assert.equal(Exception.httpStatusByType('Validation'), 400);
        assert.equal(Exception.httpStatusByType('Authentication'), 401);
        assert.equal(Exception.httpStatusByType('Unknown'), 500);
        assert.equal(Exception.httpStatusByType('CustomType' as ExceptionType), undefined);
    })


})


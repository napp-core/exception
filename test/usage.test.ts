import { test } from "node:test";
import { Exception } from "../src";


await test("usage test", async (t) => {

  await t.test("basic", () => {
    const e = new Exception("message", {
      kind: "validation",
      status: 400,
      code: "VALIDATION",
    });


    t.assert.deepEqual(e.message, "message")
    t.assert.deepEqual(e.exception.kind, "validation")
    t.assert.deepEqual(e.exception.status, 400)
    t.assert.deepEqual(e.exception.code, 'VALIDATION')
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Exception } from "../src/exception";

/** helper: cause chain kinds авах */
function kindsFromException(e: unknown): string[] {
  const out: string[] = [];
  // @ts-ignore
  let cur: any = e;
  while (cur instanceof Exception) {
    out.push(cur.error?.kind ?? "");
    // @ts-ignore
    cur = cur.cause;
  }
  return out;
}

/** helper: cause chain kinds авах (plan талаас) */
function kindsFromPlan(plan: any): string[] {
  const out: string[] = [];
  let cur: any = plan;
  while (cur && cur.error) {
    out.push(cur.error.kind ?? "");
    cur = cur.cause;
  }
  return out;
}

describe("Exception – toJSON() -> fromJSON() дугуй цикл (cause chain-тэй)", () => {
  it("cause chain-ийг бүрэн хадгалах ёстой, plan дахин сэргээхэд ижил байх ёстой", () => {
    const inner = new Exception({
      kind: "validation",
      message: "bad name",
      status: 400,
      code: "VALIDATION",
    });

    const mid = new Exception({
      kind: "authentication",
      message: "login required",
      status: 401,
      code: "AUTH_REQUIRED",
      cause: inner,
    });

    const outer = new Exception({
      kind: "permission",
      message: "access denied",
      status: 403,
      code: "NO_ACCESS",
      cause: mid,
    });

    // toJSON
    const plan = outer.toJSON();

    // шалгалтууд (plan)
    assert.equal(typeof plan.$exception, "string");
    assert.equal(plan.error.message, "access denied");
    assert.deepEqual(kindsFromPlan(plan), ["permission", "authentication", "validation"]);

    // fromJSON
    const restored = Exception.fromJSON(plan);

    // үндсэн талбарууд
    assert.equal(restored.error.kind, "permission");
    assert.equal(restored.error.message, "access denied");
    assert.equal(restored.error.status, 403);
    assert.equal(restored.error.code, "NO_ACCESS");

    // cause chain
    assert.deepEqual(kindsFromException(restored), ["permission", "authentication", "validation"]);

    // source serialize-д ордоггүй (fromJSON сэргээхэд байх ёсгүй)
    assert.equal(restored.source, undefined);

    // дахин toJSON хийж plan-тэй ижил эсэх (deterministic)
    assert.deepEqual(restored.toJSON(), plan);
  });
});

describe("Exception.clone() – BigInt/Date/Map edge кейсүүд", () => {
  it("BigInt/Date/Map төрлүүдийг алдагдуулахгүй (structuredClone дэмжигдвэл)", {
    skip: typeof (globalThis as any).structuredClone !== "function",
  }, () => {
    // BigInt
    const srcBig = { a: 10n, arr: [20n] };
    const clBig = Exception.clone(srcBig);
    assert.equal(typeof clBig.a, "bigint");
    assert.equal(clBig.a, 10n);
    assert.notEqual(clBig.arr, srcBig.arr);
    assert.equal(clBig.arr[0], 20n);

    // Date
    const d = new Date("2020-01-01T00:00:00Z");
    const srcDate = { d };
    const clDate = Exception.clone(srcDate);
    assert.ok(clDate.d instanceof Date);
    assert.equal(clDate.d.getTime(), d.getTime());
    assert.notEqual(clDate.d, d);

    // Map (дангаар нь)
    const m = new Map<string, any>([["a", { x: 1 }], ["b", 2]]);
    const clMap = Exception.clone(m);
    assert.ok(clMap instanceof Map);
    assert.notEqual(clMap, m);
    assert.equal(clMap.get("b"), 2);
    assert.deepEqual(clMap.get("a"), { x: 1 });
    assert.notEqual(clMap.get("a"), m.get("a")); // deep clone болсон эсэх

    // Map (объект дотор)
    const srcObjWithMap = { m };
    const clObjWithMap = Exception.clone(srcObjWithMap);
    assert.ok(clObjWithMap.m instanceof Map);
    assert.equal(clObjWithMap.m.get("b"), 2);
  });
});

describe("Exception – name/kind лог тогтвортой эсэх", () => {
  it("kind өгөгдсөн үед name = `Exception_<kind>` байх ёстой, fromJSON дараа нь ч ижил", () => {
    const ex = new Exception({ kind: "validation", message: "x" });
    assert.equal(ex.error.kind, "validation");
    assert.equal(ex.name, "Exception/validation");

    const plan = ex.toJSON();
    const back = Exception.fromJSON(plan);
    assert.equal(back.error.kind, "validation");
    assert.equal(back.name, "Exception/validation");
  });

  it("kind байхгүй үед name 'Exception' байх ёстой", () => {
    const ex = new Exception({ message: "plain error" });
    assert.equal((ex.error as any).kind, undefined);
    assert.equal(ex.name, "Exception");

    const back = Exception.fromJSON(ex.toJSON());
    assert.equal(back.name, "Exception");
  });

  it("message өөрчлөгдөх нь name-д нөлөөлөхгүй", () => {
    const ex = new Exception({ kind: "server", message: "A" });
    const plan = ex.toJSON();
    // сэргээхэд message = 'A' хэвээр, name stable
    const back = Exception.fromJSON(plan);
    assert.equal(back.name, "Exception/server");
    assert.equal(back.error.message, "A");
  });
});

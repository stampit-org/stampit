import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("corner-cases", () => {
  it("stamp.compose() deep merge bad deepProps", () => {
    const stamp = stampit({ props: { a: 1 } });
    stamp.compose = null;
    const o = stamp();

    assert.equal(o.a, undefined);
  });

  it("props override a getter-only method without throwing", () => {
    const o = stampit({
      methods: {
        get x() {
          return "getter";
        },
      },
      props: { x: "prop" },
    })();
    assert.ok(Object.prototype.hasOwnProperty.call(o, "x"));
    assert.equal(o.x, "prop");
  });

  it("props do not invoke a setter defined in methods", () => {
    let calls = 0;
    const o = stampit({
      methods: {
        set x(v) {
          calls++;
        },
      },
      props: { x: "prop" },
    })();
    assert.equal(o.x, "prop");
    assert.equal(calls, 0);
  });

  it("statics can override read-only function properties", () => {
    assert.equal(stampit({ statics: { name: "Foo" } }).name, "Foo");
    assert.equal(stampit({ statics: { length: 2 } }).length, 2);
  });

  it("frozen props and deepProps stay writable and overridable", () => {
    const stamp = stampit({ props: Object.freeze({ a: 1 }), deepProps: Object.freeze({ d: Object.freeze({ x: 1 }) }) });
    const o = stamp.compose({ props: { a: 2 }, deepProps: { d: { y: 2 } } })();
    assert.equal(o.a, 2);
    assert.deepEqual(o.d, { x: 1, y: 2 });
    o.a = 3;
    assert.equal(o.a, 3);
  });

  it("deepProps override a getter-only deepProp without throwing", () => {
    const o = stampit(
      {
        deepProps: {
          get x() {
            return "getter";
          },
        },
      },
      { deepProps: { x: "prop" } },
    )();
    assert.equal(o.x, "prop");
  });
});

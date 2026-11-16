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
    const o = stampit({ methods: { get x() { return "getter"; } }, props: { x: "prop" } })();
    assert.ok(Object.prototype.hasOwnProperty.call(o, "x"));
    assert.equal(o.x, "prop");
  });

  it("props do not invoke a setter defined in methods", () => {
    let calls = 0;
    const o = stampit({ methods: { set x(v) { calls++; } }, props: { x: "prop" } })();
    assert.equal(o.x, "prop");
    assert.equal(calls, 0);
  });

  it("statics can override read-only function properties", () => {
    assert.equal(stampit({ statics: { name: "Foo" } }).name, "Foo");
    assert.equal(stampit({ statics: { length: 2 } }).length, 2);
  });
});

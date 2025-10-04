import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("immutability", () => {
  it("Basic stamp immutability", () => {
    const methods = { f() {} };
    const props = { s: { deep: 1 } };
    const deepProps = { p: { deep: 1 } };
    const init = () => {};
    const stamp1 = stampit({ methods, props, deepProps, init });

    methods.f = () => {};
    props.s.deep = 2;
    deepProps.p.deep = 2;
    const stamp2 = stampit({ methods, props, deepProps, init });

    assert.notEqual(stamp1.compose.methods, stamp2.compose.methods);
    assert.notEqual(stamp1.compose.methods.f, stamp2.compose.methods.f);
    assert.notEqual(stamp1.compose.properties, stamp2.compose.properties);
    assert.equal(stamp1.compose.properties.s, stamp2.compose.properties.s);
    assert.equal(stamp1.compose.properties.s.deep, stamp2.compose.properties.s.deep);
    assert.notEqual(stamp1.compose.deepProperties, stamp2.compose.properties);
    assert.notEqual(stamp1.compose.deepProperties.p, stamp2.compose.deepProperties.p);
    assert.notEqual(stamp1.compose.deepProperties.p.deep, stamp2.compose.deepProperties.p.deep);
    assert.notEqual(stamp1.compose.initializers, stamp2.compose.initializers);
  });

  it("Stamp immutability made of same source", () => {
    const methods = { f() {} };
    const props = { s: { deep: 1 } };
    const deepProps = { p: { deep: 1 } };
    const init = () => {};
    const stamp1 = stampit({ methods, props, deepProps, init });
    const stamp2 = stampit({ methods, props, deepProps, init });

    assert.notEqual(stamp1.compose.methods, stamp2.compose.methods);
    assert.notEqual(stamp1.compose.properties, stamp2.compose.properties);
    assert.equal(stamp1.compose.properties.s, stamp2.compose.properties.s);
    assert.notEqual(stamp1.compose.deepProperties, stamp2.compose.deepProperties);
    assert.notEqual(stamp1.compose.deepProperties.p, stamp2.compose.deepProperties.p);
    assert.notEqual(stamp1.compose.initializers, stamp2.compose.initializers);
  });

  it("Basic object immutability", () => {
    const methods = { f() {} };
    const props = { s: { deep: 1 } };
    const deepProps = { p: { deep: 1 } };
    const o1 = stampit({ methods, props, deepProps })();

    methods.f = () => {};
    props.s.deep = 2;
    deepProps.p.deep = 2;
    const o2 = stampit({ methods, props, deepProps })();

    assert.notEqual(o1, o2);
    assert.notEqual(o1.f, o2.f);
    assert.equal(o1.s, o2.s);
    assert.equal(o1.s.deep, o2.s.deep);
    assert.notEqual(o1.p, o2.p);
    assert.notEqual(o1.p.deep, o2.p.deep);
  });

  it("Stamp chaining functions immutability", () => {
    const stamp1 = stampit();
    const stamp2 = stamp1.methods({ f() {} });
    const stamp3 = stamp2.properties({ s: { deep: 1 } });
    const stamp4 = stamp3.init(() => {});
    const stamp5 = stamp2.deepProperties({ p: { deep: 1 } });
    const stamp6 = stamp4.compose(stampit());

    assert.notEqual(stamp1, stamp2);
    assert.notEqual(stamp2, stamp3);
    assert.notEqual(stamp3, stamp4);
    assert.notEqual(stamp4, stamp5);
    assert.notEqual(stamp5, stamp6);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

function isFunction(obj) {
  return typeof obj === "function";
}
function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}

describe("stampit api", () => {
  it("stampit()", () => {
    assert.equal(typeof stampit(), "function", "Should produce a function.");
  });

  it("stampit({})", () => {
    assert.ok(isStamp(stampit({})));
  });

  it("incorrect stampit({ methods }) args", () => {
    assert.deepEqual(stampit({ methods: 42 }).compose.methods, undefined);
    assert.deepEqual(stampit({ methods: null }).compose.methods, undefined);
    assert.deepEqual(stampit({ methods: "a string" }).compose.methods, undefined);
  });

  it("incorrect stampit({ props }) args", () => {
    assert.deepEqual(stampit({ props: 42 }).compose.properties, undefined);
    assert.deepEqual(stampit({ props: null }).compose.properties, undefined);
  });

  it("incorrect stampit({ init }) args", () => {
    assert.deepEqual(stampit({ init: 42 }).compose.initializers, undefined);
    assert.deepEqual(stampit({ init: null }).compose.initializers, undefined);
    assert.deepEqual(stampit({ init: [undefined] }).compose.initializers, undefined);
    assert.deepEqual(stampit({ init: new RegExp() }).compose.initializers, undefined);
    assert.deepEqual(stampit({ init: [42] }).compose.initializers, undefined);
    assert.deepEqual(stampit({ init: "a string" }).compose.initializers, undefined);
  });

  it("incorrect stampit({ deepProps }) args", () => {
    assert.deepEqual(stampit({ deepProps: 42 }).compose.deepProperties, undefined);
    assert.deepEqual(stampit({ deepProps: null }).compose.deepProperties, undefined);
  });

  it("multiple arguments stampit(arg1, arg2, ...)", () => {
    assert.equal(
      stampit(null, { init() {} }).compose.initializers.length,
      1,
      "must recognize init from second argument",
    );
    assert.equal(
      stampit(null, { props: { x: 2 } }).compose.properties.x,
      2,
      "must recognize props from second argument",
    );
    assert.equal(
      stampit(null, { deepProps: { x: 2 } }).compose.deepProperties.x,
      2,
      "must recognize deepProps from second argument",
    );
    assert.equal(
      stampit(null, { statics: { x: 2 } }).compose.staticProperties.x,
      2,
      "must recognize statics properties from second argument",
    );
    assert.equal(
      stampit(null, { conf: { x: 2 } }).compose.configuration.x,
      2,
      "must recognize conf properties from second argument",
    );
    assert.equal(
      stampit(null, { deepConf: { x: 2 } }).compose.deepConfiguration.x,
      2,
      "must recognize deepConf properties from second argument",
    );
    assert.deepEqual(
      stampit(null, { propertyDescriptors: { x: { writable: true } } }).compose.propertyDescriptors,
      { x: { writable: true } },
      "must recognize propertyDescriptors properties from second argument",
    );
    assert.deepEqual(
      stampit(null, { staticPropertyDescriptors: { x: { writable: true } } }).compose.staticPropertyDescriptors,
      { x: { writable: true } },
      "must recognize staticPropertyDescriptors properties from second argument",
    );
  });
});

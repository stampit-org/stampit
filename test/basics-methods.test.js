import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("basics methods", () => {
  it("stampit({ methods })", () => {
    const obj = stampit({
      methods: {
        foo() {
          return "foo";
        },
      },
    }).create();

    assert.ok(obj.foo() && !obj.hasOwnProperty("foo"), "Should set the new object's prototype.");
  });

  it("stampit().methods()", () => {
    const obj = stampit()
      .methods({
        foo() {
          return "foo";
        },
        methodOverride() {
          return false;
        },
        prop1: 1,
      })
      .methods({
        bar() {
          return "bar";
        },
        methodOverride() {
          return true;
        },
        prop2: 2,
      })
      .create();

    assert.ok(obj.foo() && !obj.hasOwnProperty("foo"), "Should set the new object's prototype.");
    assert.ok(obj.bar() && !obj.hasOwnProperty("bar"), "Should let you chain .methods() to add more.");
    assert.ok(
      obj.methodOverride() && !obj.hasOwnProperty("methodOverride"),
      "Should let you override by chaining .methods().",
    );
    assert.ok(obj.prop1 && !obj.hasOwnProperty("prop1"), "Should mix properties.");
    assert.ok(obj.prop2 && !obj.hasOwnProperty("prop1"), "Should mix properties.");
  });

  it("stampit({ methods }).methods()", () => {
    const obj = stampit({
      methods: {
        foo() {
          return "foo";
        },
        methodOverride() {
          return false;
        },
        prop1: 1,
      },
    })
      .methods({
        bar() {
          return "bar";
        },
        methodOverride() {
          return true;
        },
        prop2: 2,
      })
      .create();

    assert.ok(obj.foo() && !obj.hasOwnProperty("foo"), "Should set the new object's prototype.");
    assert.ok(obj.bar() && !obj.hasOwnProperty("bar"), "Should let you chain .methods() to add more.");
    assert.ok(
      obj.methodOverride() && !obj.hasOwnProperty("methodOverride"),
      "Should let you override by chaining .methods().",
    );
    assert.ok(obj.prop1 && !obj.hasOwnProperty("prop1"), "Should mix properties.");
    assert.ok(obj.prop2 && !obj.hasOwnProperty("prop1"), "Should mix properties.");
  });

  it("stampit().methods(a, b)", () => {
    const obj = stampit()
      .methods(
        {
          a() {
            return "a";
          },
        },
        {
          b() {
            return "b";
          },
        },
      )
      .create();

    assert.ok(obj.a() === "a" && obj.b() === "b", "Should mixIn objects when multiple methods are passed.");
  });
});

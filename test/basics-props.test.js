import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("basics props", () => {
  it("stampit({ props })", () => {
    const obj = stampit({ props: { foo: { bar: "bar" } } }).create();

    assert.equal(obj.foo.bar, "bar", "Should set default props.");
  });

  it("stampit().props()", () => {
    const obj = stampit()
      .props({
        foo: { bar: "bar" },
        propsOverride: false,
        func1() {},
      })
      .props({
        bar: "bar",
        propsOverride: true,
        func2() {},
      })
      .create();

    assert.equal(obj.foo.bar, "bar", "Should set default props.");
    assert.equal(obj.bar, "bar", "Should set let you add by chaining .props().");
    assert.ok(obj.propsOverride, "Should set let you override by chaining .props().");
    assert.ok(obj.func1, "Should mix functions.");
    assert.ok(obj.func2, "Should mix functions.");
  });

  it("stampit({ props }).props()", () => {
    const obj = stampit({
      props: {
        foo: { bar: "bar" },
        propsOverride: false,
        func1() {},
      },
    })
      .props({
        bar: "bar",
        propsOverride: true,
        func2() {},
      })
      .create();

    assert.equal(obj.foo.bar, "bar", "Should set default props.");
    assert.equal(obj.bar, "bar", "Should set let you add by chaining .props().");
    assert.ok(obj.propsOverride, "Should set let you override by chaining .props().");
    assert.ok(obj.func1, "Should mix functions.");
    assert.ok(obj.func2, "Should mix functions.");
  });

  it("stampit().props(a, b)", () => {
    const obj = stampit()
      .props(
        {
          a: "a",
        },
        {
          b: "b",
        },
      )
      .create();

    assert.ok(obj.a && obj.b, "Should mixIn objects when multiple objects are passed.");
  });
});

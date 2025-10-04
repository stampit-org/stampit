import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("basics statics", () => {
  it("stampit().statics()", () => {
    const stamp1 = stampit().statics({
      foo() {
        return 42;
      },
      bar: "space",
    });

    assert.ok(stamp1.foo, "Should add statics props to factory.");
    assert.equal(stamp1.foo(), 42, "Should set proper reference.");
    assert.equal(stamp1.bar, "space", "Should set proper reference.");
  });

  it("stampit({statics})", () => {
    const stamp1 = stampit({
      statics: {
        foo: 42,
      },
    });

    assert.equal(stamp1.foo, 42, "Should accept statics in options.");
  });

  it("stampit().statics() last override", () => {
    const stamp1 = stampit().statics({
      foo() {
        return "override";
      },
    });

    const stamp2 = stampit()
      .statics({
        foo() {},
      })
      .compose(stamp1);

    assert.equal(stamp2.foo(), "override", "Should override props during composition.");
  });

  it("stampit().statics(arg1, arg2)", () => {
    const stamp1 = stampit().statics(
      {
        foo1() {},
      },
      {
        foo2() {},
      },
    );

    assert.ok(stamp1.foo1, "Should accept multiple args.");
    assert.ok(stamp1.foo2, "Should accept multiple args.");
  });

  it("stampit({statics}).statics()", () => {
    const stamp1 = stampit({
      statics: {
        foo1: "foo1 value",
      },
    }).statics({
      foo2() {
        return "foo2 value";
      },
    });

    assert.equal(stamp1.foo1, "foo1 value", "Should have statics from options.");
    assert.equal(stamp1.foo2(), "foo2 value", "Should have statics form chain method.");
  });
});

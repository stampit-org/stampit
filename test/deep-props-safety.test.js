import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("deep props safety", () => {
  it("Stamp deepProps deep cloned for object created", () => {
    const deep = { foo: "foo", bar: "bar" };
    const stamp1 = stampit().deepProps({ deep: deep, baz: "baz" });
    const stamp2 = stampit({ deepProps: { deep: deep, baz: "baz" } });

    let o1 = stamp1();
    let o2 = stamp1();
    o1.baz = "another value";
    assert.notEqual(o1.baz, o2.baz);
    o1.deep.foo = "another value";
    assert.notEqual(o1.deep.foo, o2.deep.foo);

    o1 = stamp2();
    o2 = stamp2();
    o1.baz = "another value";
    assert.notEqual(o1.baz, o2.baz);
    o1.deep.foo = "another value";
    assert.notEqual(o1.deep.foo, o2.deep.foo);
  });

  it("stamp.compose() deep merge deepProps", () => {
    const stamp = stampit({
      deepProps: {
        deep: { foo: "foo", bar: "bar", NULL: null, ZERO: 0 },
        foo: "foo",
        bar: "bar",
      },
    }).compose(
      stampit({
        deepProps: {
          deep: { foo: "override", baz: "baz", NULL: "STRING", ZERO: "STRING" },
          foo: "override",
          baz: "baz",
        },
      }),
    );
    const o = stamp();

    assert.equal(o.foo, "override");
    assert.equal(o.bar, "bar");
    assert.equal(o.baz, "baz");
    assert.equal(o.deep.foo, "override");
    assert.equal(o.deep.bar, "bar");
    assert.equal(o.deep.baz, "baz");
    assert.equal(o.deep.NULL, "STRING");
    assert.equal(o.deep.ZERO, "STRING");
  });

  it("stamp.compose() deep merge bad deepProps", () => {
    const stamp = stampit().compose(
      {
        deepProperties: null,
      },
      {
        deepProps: {
          deep: { foo: "override", baz: "baz", NULL: "STRING", ZERO: "STRING" },
          foo: "override",
          baz: "baz",
        },
      },
    );
    const o = stamp();

    assert.equal(o.foo, "override");
    assert.equal(o.baz, "baz");
    assert.equal(o.deep.foo, "override");
    assert.equal(o.deep.baz, "baz");
    assert.equal(o.deep.NULL, "STRING");
    assert.equal(o.deep.ZERO, "STRING");
  });
});

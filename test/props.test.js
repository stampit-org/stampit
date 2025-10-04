import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("props", () => {
  it("Stamp props shallow copied for object created", () => {
    const deep = { foo: "foo", bar: "bar" };
    const stamp1 = stampit().props({ deep: deep, foo: "foo" });
    const stamp2 = stampit({ props: { deep: deep, foo: "foo" } });

    const o1 = stamp1();
    const o2 = stamp2();
    o1.deep.foo = "another value";

    assert.equal(o1.foo, o2.foo);
    assert.equal(o1.deep, o2.deep);
    assert.equal(o1.deep.foo, o2.deep.foo);
  });

  it("stamp.compose() shallow copy props", () => {
    const stamp = stampit({
      props: {
        deep: { foo: "1", bar: "1" },
        foo: "1",
        bar: "1",
      },
    }).compose(
      stampit({
        props: {
          deep: { foo: "override", baz: "baz" },
          foo: "override",
          baz: "baz",
        },
      }),
    );
    const o = stamp();

    assert.equal(o.foo, "override");
    assert.equal(o.bar, "1");
    assert.equal(o.baz, "baz");
    assert.equal(o.deep.foo, "override");
    assert.equal(o.deep.bar, undefined);
    assert.equal(o.deep.baz, "baz");
  });
});

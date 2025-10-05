import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("basics", () => {
  it("should be named function", async () => {
    assert.ok(typeof stampit === "function");
    assert.equal(stampit.name, "stampit");
    assert.equal(stampit().name, "Stamp");
  });

  it(".create()", () => {
    const stamp = stampit({
      methods: {
        foo() {
          return "foo";
        },
      },
    });

    assert.ok(stamp.create);
    assert.equal(stamp.create().foo(), "foo", "Should produce an object from specified prototypes.");
  });

  it(".create(options)", () => {
    let initCalled = false;
    const stamp = stampit().init((options) => {
      assert.deepEqual(options, { foo: "bar" }, "Should pass options object to initializer.");
      initCalled = true;
    });

    assert.ok(stamp.create);
    stamp.create({ foo: "bar" });

    assert.ok(initCalled, "Should call initializer.");
  });
});

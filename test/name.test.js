import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("name", () => {
  it("name metadata can be set", () => {
    const stamp = stampit({
      name: "MyFactory",
    });

    assert.equal(stamp.name, "MyFactory", "Should produce stamp with non-default name");
  });

  it("name metadata is inherited", () => {
    const stamp = stampit({
      name: "MyFactory",
    });
    const derived = stamp.compose({
      staticPropertyDescriptors: { value: { x: "whatever" } },
    });

    assert.equal(derived.name, "MyFactory", "Should inherit name from previous stamp");
    assert.equal(derived.compose.staticPropertyDescriptors.value.x, "whatever", "Should not loose other data");
  });

  it("name metadata can be overwritten", () => {
    const stamp = stampit({
      name: "MyFactory",
    });
    const derived = stamp.compose({ name: "SecondOne" });

    assert.equal(derived.name, "SecondOne", "Should overwrite previous stamp name");
  });
});

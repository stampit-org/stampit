import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("basics init", () => {
  it("stampit({ init })", () => {
    const obj = stampit({
      init() {
        const secret = "foo";
        this.getSecret = () => {
          return secret;
        };
      },
    }).create();

    assert.equal(obj.getSecret(), "foo", "Should set closure.");
  });

  it("stampit().init()", () => {
    const obj = stampit()
      .init(function () {
        const secret = "foo";
        this.getSecret = () => {
          return secret;
        };
      })
      .init(function () {
        this.a = "a";
      })
      .create();

    assert.equal(obj.getSecret(), "foo", "Should set closure.");
    assert.ok(obj.a, "Should allow chaining.");
  });

  it("stampit({ init }).init()", () => {
    const obj = stampit({
      init() {
        const secret = "foo";
        this.getSecret = () => {
          return secret;
        };
      },
    })
      .init(function () {
        this.a = "a";
      })
      .create();

    assert.equal(obj.getSecret(), "foo", "Should set closure.");
    assert.ok(obj.a, "Should allow chaining.");
  });
});

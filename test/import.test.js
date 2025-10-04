import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

describe("import", () => {
  it('infection works using the require("stampit")', () => {
    const obj = require("../stampit.js")
      .default()
      .init(function () {
        const secret = "foo";
        this.getSecret = () => {
          return secret;
        };
      })
      .methods({
        foo() {
          return "foo";
        },
      })
      .create();

    assert.equal(obj.getSecret(), "foo", "Should create infected stamps with shortcuts");
    assert.ok(obj.foo() === "foo", "Should create infected stamps from infected stamps with shortcuts");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("corner-cases", () => {
  it("stamp.compose() deep merge bad deepProps", () => {
    const stamp = stampit({ props: { a: 1 } });
    stamp.compose = null;
    const o = stamp();

    assert.equal(o.a, undefined);
  });
});

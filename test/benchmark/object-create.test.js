import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../../stampit.js";

import Benchmark from "benchmark";

describe("object-create", () => {
  it("benchmarking object creation", (t) => {
    const { resolve, promise } = Promise.withResolvers();

    const Stamp = stampit(
      {
        init() {
          this.x = 10;
          this.y = 10;
        },
        props: { p1: 10, p2: 10 },
        methods: { m1() {}, m() {} },
        statics: { s1() {} },
      },
      {
        init() {
          this.x2 = 10;
          this.y2 = 10;
        },
        props: { p1: 10, p2: 10 },
        methods: { m2() {}, m() {} },
        statics: { s2() {} },
      },
      {
        init() {
          this.x3 = 10;
          this.y3 = 10;
        },
        props: { p1: 10, p2: 10 },
        methods: { m3() {}, m() {} },
        statics: { s3() {} },
      },
    );

    class Class {
      constructor() {
        this.p1 = 10;
        this.p2 = 10;
        this.x = 10;
        this.y = 10;
      }
      m1() {}
      m() {}
      static s1() {}
    }

    class Class2 extends Class {
      constructor() {
        super();
        this.p1 = 10;
        this.p2 = 10;
        this.x2 = 10;
        this.y2 = 10;
      }
      m2() {}
      m() {}
      static s2() {}
    }

    class Class3 extends Class2 {
      constructor() {
        super();
        this.p1 = 10;
        this.p2 = 10;
        this.x3 = 10;
        this.y3 = 10;
      }
      m3() {}
      m() {}
      static s3() {}
    }

    const suite = new Benchmark.Suite();
    const results = [];
    suite
      .add("Stamp", () => {
        Stamp();
      })
      .add("Class", () => {
        new Class3();
      })
      .on("cycle", (event) => {
        results.push(String(event.target));
      })
      .on("complete", function () {
        const MAX = 500;
        assert.ok(
          this[0].hz / this[1].hz >= 1 / MAX,
          `creating a stamp should be less than ${MAX} times slower, but was ${this[1].hz / this[0].hz}`,
        );
        t.diagnostic(results.join(". "));
        resolve();
      })
      .run();

    return promise;
  });
});

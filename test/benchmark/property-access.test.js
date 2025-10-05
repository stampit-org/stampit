import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../../stampit.js";

import Benchmark from "benchmark";

describe("property access", () => {
  it("benchmarking property access", async (t) => {
    const { resolve, promise } = Promise.withResolvers();

    const Position = stampit({
      methods: { a() {} },
      init() {
        this.x = 10;
        this.y = 10;
      },
    });

    const Velocity = stampit({
      methods: { a() {} },
      init() {
        this.vx = 10;
        this.vy = 10;
      },
    });

    const Entity = stampit({
      methods: { a() {} },
      deepProps: {
        components: {},
      },
      init() {
        this.components.position = Position();
        this.components.velocity = Velocity();
      },
    });

    const stampitEntity = Entity();
    const normalEntity = {
      components: {
        position: {
          x: 10,
          y: 10,
        },
        velocity: {
          vy: 10,
          vx: 10,
        },
      },
    };

    const suite = new Benchmark.Suite();
    const results = [];
    suite
      .add("Stampit", () => {
        const entity = stampitEntity.components;

        entity.position.x += entity.velocity.vx;
        entity.position.y += entity.velocity.vy;
      })
      .add("Plain object", () => {
        const entity = normalEntity.components;

        entity.position.x += entity.velocity.vx;
        entity.position.y += entity.velocity.vy;
      })
      .on("cycle", (event) => {
        results.push(String(event.target));
      })
      .on("complete", function () {
        assert.ok(this[0].hz / this[1].hz >= 0.5, "object instances property access must be as fast as plain object.");
        t.diagnostic(results.join(". "));
        resolve();
      })
      .run();

    return promise;
  });
});

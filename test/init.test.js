import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";

describe("init", () => {
  it("stamp.init() arguments are passed", () => {
    let initStamp;
    const outerStamp = stampit().init((options, { instance, stamp, args }) => {
      assert.ok(instance, "{ instance } should exist");
      assert.equal(typeof instance, "object", "{ instance } should be object");
      assert.ok(stamp, "{ stamp } should exist");
      assert.equal(typeof stamp, "function", "{ stamp } should be function");
      assert.ok(args, "{ args } should exist");
      assert.ok(Array.isArray(args), "{ args } should be array");
      initStamp = stamp;
    });

    outerStamp();

    assert.strictEqual(outerStamp, initStamp, "{ stamp } === stamp returned");
  });

  it("stamp.init() should assign `this` to `{ instance }`", () => {
    let initCalled = false;
    const stamp = stampit().init(function (options, { instance }) {
      assert.ok(instance === this, "{ instance } should equal `this`");
      initCalled = true;
    });

    stamp();

    assert.ok(initCalled, "initializer must be called");
  });

  it("stamp.init() should assign stamp to `{ stamp }`", () => {
    let initCalled = false;
    const outerStamp = stampit().init((options, { stamp }) => {
      assert.ok(outerStamp === stamp, "{ stamp } should equal stamp");
      initCalled = true;
    });

    outerStamp();

    assert.ok(initCalled, "initializer must be called");
  });

  it("stamp.init() should assign arguments to `{ args }`", () => {
    let initCalled = false;
    const stamp = stampit().init((options, { args }) => {
      assert.equal(args[0], "arg1", "{ args } should equal arguments");
      assert.equal(args[1], undefined, "{ args } should equal arguments");
      assert.equal(args[2], "arg3", "{ args } should equal arguments");
      initCalled = true;
    });

    stamp("arg1", undefined, "arg3");

    assert.ok(initCalled, "initializer must be called");
  });

  it("stamp.init() can handle multiple init functions", () => {
    let init1;
    let init2;
    let init3;

    const stamp = stampit()
      .init(() => {
        init1 = true;
      })
      .init(() => {
        init2 = true;
      })
      .init(() => {
        init3 = true;
      });

    stamp();

    assert.ok(init1, "init 1 fired");
    assert.ok(init2, "init 2 fired");
    assert.ok(init3, "init 3 fired");
  });

  it("stamp.init() can handle multiple init functions assigned with array", () => {
    let init1;
    let init2;
    let init3;

    const stamp = stampit().init([
      () => {
        init1 = true;
      },
      () => {
        init2 = true;
      },
      () => {
        init3 = true;
      },
    ]);

    stamp();

    assert.ok(init1, "init 1 fired");
    assert.ok(init2, "init 2 fired");
    assert.ok(init3, "init 3 fired");
  });

  it("stamp.init() should call composed init functions in order", () => {
    const result = [];

    const stamp = stampit()
      .init(() => {
        result.push("a");
      })
      .init(() => {
        result.push("b");
      })
      .init(() => {
        result.push("c");
      });

    const stamp2 = stampit().init([
      () => {
        result.push("d");
      },
      () => {
        result.push("e");
      },
    ]);

    const stamp3 = stampit().compose(stamp, stamp2);

    stamp3();

    assert.deepEqual(result, ["a", "b", "c", "d", "e"], "init called in order");
  });

  it("explicit push wrong object to stamp.compose.initializers[]", () => {
    const stamp = stampit({
      init() {
        const secret = "foo";
        this.getSecret = () => {
          return secret;
        };
      },
    });

    stamp.compose.initializers.push(42); // breaking the stamp.
    const obj = stamp();

    assert.equal(obj.getSecret(), "foo", "Should omit malformed compose.initializers[] elements.");
  });

  it("stamp.compose.initializers malformed object", () => {
    const stamp = stampit()
      .props({ ref: 42 })
      .init(function () {
        const secret = "foo";
        this.getSecret = () => {
          return secret;
        };
      });

    stamp.compose.initializers = 42; // breaking the stamp badly
    const obj = stamp();

    assert.ok(obj.ref, 42, "Should be okay with malformed compose.init.");
  });

  it("changing second arg is not propagated", () => {
    let initCalled = false;
    const stamp = stampit()
      .init((opts, arg2) => {
        arg2.instance = null;
        arg2.stamp = null;
        arg2.args = null;
      })
      .init((opts, arg2) => {
        assert.notEqual(arg2.instance, null, ".instance was mutated");
        assert.notEqual(arg2.stamp, null, ".stamp was mutated");
        assert.notEqual(arg2.args, null, ".args was mutated");
        initCalled = true;
      });

    stamp();

    assert.ok(initCalled, "initializer must be called");
  });
});

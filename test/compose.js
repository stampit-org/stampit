import test from "tape";
import stampit from "../stampit.js";

// Compose

test("stampit().compose()", (t) => {
  let closuresCalled = 0;
  const a = stampit({
    methods: {
      method() {
        return false;
      },
    },
    init() {
      closuresCalled += 1;
    },
    props: { prop: false },
  });
  const b = stampit({
    methods: {
      method() {
        return true;
      },
    },
    init() {
      closuresCalled += 1;
    },
    props: { prop: true },
  });
  const d = a.compose(b).create();

  t.ok(d.method() && d.prop, "Last stamp must win.");
  t.equal(closuresCalled, 2, "Each stamp closure must be called.");

  t.end();
});

test("stampit().compose() with extended descriptors", (t) => {
  const stamp = stampit().compose({
    props: { a: 1 },
    init() {},
    deepProps: { a: 1 },
    statics: { a: 1 },
    deepStatics: { a: 1 },
    conf: { a: 1 },
    deepConf: { a: 1 },
  });
  const d = stamp.compose;

  t.deepEqual(d.properties, { a: 1 }, 'should compose "props"');
  t.deepEqual(d.deepProperties, { a: 1 }, 'should compose "deepProps"');
  t.equal(d.staticProperties.a, 1, 'should compose "statics"');
  t.deepEqual(d.staticDeepProperties, { a: 1 }, 'should compose "deepStatics"');
  t.deepEqual(d.configuration, { a: 1 }, 'should compose "conf"');
  t.deepEqual(d.deepConfiguration, { a: 1 }, 'should compose "deepConf"');
  t.ok(d.initializers.length === 1 && typeof d.initializers[0] === "function", 'should compose "init"');

  t.end();
});

test("stampit().compose() with extended stamps", (t) => {
  const stamp = stampit().compose({
    props: { a: 1 },
    init() {},
    deepProps: { a: 1 },
    statics: { a: 1 },
    deepStatics: { a: 1 },
    conf: { a: 1 },
    deepConf: { a: 1 },
  });
  const d = stampit().compose(stamp).compose;

  t.deepEqual(d.properties, { a: 1 }, 'should compose "props"');
  t.deepEqual(d.deepProperties, { a: 1 }, 'should compose "deepProps"');
  t.equal(d.staticProperties.a, 1, 'should compose "statics"');
  t.deepEqual(d.staticDeepProperties, { a: 1 }, 'should compose "deepStatics"');
  t.deepEqual(d.configuration, { a: 1 }, 'should compose "conf"');
  t.deepEqual(d.deepConfiguration, { a: 1 }, 'should compose "deepConf"');
  t.ok(d.initializers.length === 1 && typeof d.initializers[0] === "function", 'should compose "init"');

  t.end();
});

test("stampit().compose() with extended stamps and descriptors", (t) => {
  const stamp1 = stampit({
    props: { a: 1 },
  });
  const stamp2 = stampit().compose({
    props: { b: 1 },
  });
  const descriptor1 = {
    init() {},
  };
  const descriptor2 = {
    deepProps: { a: 1 },
    statics: { a: 1 },
    deepStatics: { a: 1 },
    conf: { a: 1 },
    deepConf: { a: 1 },
  };
  const d = stampit().compose(stamp1, descriptor1, stamp2, descriptor2).compose;

  t.deepEqual(d.properties, { a: 1, b: 1 }, 'should compose "props"');
  t.deepEqual(d.deepProperties, { a: 1 }, 'should compose "deepProps"');
  t.equal(d.staticProperties.a, 1, 'should compose "statics"');
  t.deepEqual(d.staticDeepProperties, { a: 1 }, 'should compose "deepStatics"');
  t.deepEqual(d.configuration, { a: 1 }, 'should compose "conf"');
  t.deepEqual(d.deepConfiguration, { a: 1 }, 'should compose "deepConf"');
  t.ok(d.initializers.length === 1 && typeof d.initializers[0] === "function", 'should compose "init"');

  t.end();
});

import stampit from '../src/stampit';
import { test } from 'ava';
// Compose

test('stampit().compose()', (t) => {
  let closuresCalled = 0;
  const a = stampit({
    methods: {
      method() {
        return false;
      }
    },
    refs: {ref: false},
    init() {
      closuresCalled++;
    },
    props: {prop: false}
  });
  const b = stampit({
    methods: {
      method() {
        return true;
      }
    },
    refs: {ref: true},
    init() {
      closuresCalled++;
    },
    props: {prop: true}
  });
  const d = a.compose(b).create();

  t.truthy(d.method() && d.ref && d.prop, 'Last stamp must win.');
  t.is(closuresCalled, 2, 'Each stamp closure must be called.');
});

test('stampit.compose()', (t) => {
  const a = stampit({
    methods: {
      methodA() {
        return true;
      }
    },
    refs: {refA: true},
    init() {
      const secret = 'a';
      this.getA = () => {
        return secret;
      };
    },
    props: {propA: '1'}
  });
  const b = stampit({
    methods: {
      methodB() {
        return true;
      }
    },
    refs: {refB: true},
    init() {
      const secret = true;
      this.getB = () => {
        return secret;
      };
    },
    props: {propB: '1'}
  });
  const c = stampit({
    methods: {
      methodC() {
        return true;
      }
    },
    refs: {refC: true},
    init() {
      const secret = true;
      this.getC = () => {
        return secret;
      };
    },
    props: {propC: '1'}
  });
  const d = stampit.compose(a, b, c).create();

  t.truthy(d.methodA && d.refA && d.getA && d.propA &&
    d.methodB && d.refB && d.getB && d.propB &&
    d.methodC && d.refC && d.getC && d.propC,
    'Should compose all factory prototypes');
});

test('stampit().compose() with extended descriptors', (t) => {
  const stamp = stampit().compose({
    props: {a: 1},
    refs: {b: 1},
    init() {},
    deepProps: {a: 1},
    statics: {a: 1},
    deepStatics: {a: 1},
    conf: {a: 1},
    deepConf: {a: 1}
  });
  const d = stamp.compose;

  t.deepEqual(d.properties, {a: 1, b: 1},
    'should compose "props" and "refs"');
  t.deepEqual(d.deepProperties, {a: 1},
    'should compose "deepProps"');
  t.is(d.staticProperties.a, 1,
    'should compose "statics"');
  t.deepEqual(d.staticDeepProperties, {a: 1},
    'should compose "deepStatics"');
  t.deepEqual(d.configuration, {a: 1},
    'should compose "conf"');
  t.deepEqual(d.deepConfiguration, {a: 1},
    'should compose "deepConf"');
  t.truthy(d.initializers.length === 1 && typeof d.initializers[0] === 'function',
    'should compose "init"');
});

test('stampit().compose() with extended stamps', (t) => {
  const stamp = stampit().compose({
    props: {a: 1},
    refs: {b: 1},
    init() {},
    deepProps: {a: 1},
    statics: {a: 1},
    deepStatics: {a: 1},
    conf: {a: 1},
    deepConf: {a: 1}
  });
  const d = stampit().compose(stamp).compose;

  t.deepEqual(d.properties, {a: 1, b: 1},
    'should compose "props" and "refs"');
  t.deepEqual(d.deepProperties, {a: 1},
    'should compose "deepProps"');
  t.is(d.staticProperties.a, 1,
    'should compose "statics"');
  t.deepEqual(d.staticDeepProperties, {a: 1},
    'should compose "deepStatics"');
  t.deepEqual(d.configuration, {a: 1},
    'should compose "conf"');
  t.deepEqual(d.deepConfiguration, {a: 1},
    'should compose "deepConf"');
  t.truthy(d.initializers.length === 1 && typeof d.initializers[0] === 'function',
    'should compose "init"');
});

test('stampit().compose() with extended stamps and descriptors', (t) => {
  const stamp1 = stampit({
    props: {a: 1}
  });
  const stamp2 = stampit().compose({
    refs: {b: 1}
  });
  const descriptor1 = {
    init() {}
  };
  const descriptor2 = {
    deepProps: {a: 1},
    statics: {a: 1},
    deepStatics: {a: 1},
    conf: {a: 1},
    deepConf: {a: 1}
  };
  const d = stampit().compose(stamp1, descriptor1, stamp2, descriptor2).compose;

  t.deepEqual(d.properties, {a: 1, b: 1},
    'should compose "props" and "refs"');
  t.deepEqual(d.deepProperties, {a: 1},
    'should compose "deepProps"');
  t.is(d.staticProperties.a, 1,
    'should compose "statics"');
  t.deepEqual(d.staticDeepProperties, {a: 1},
    'should compose "deepStatics"');
  t.deepEqual(d.configuration, {a: 1},
    'should compose "conf"');
  t.deepEqual(d.deepConfiguration, {a: 1},
    'should compose "deepConf"');
  t.truthy(d.initializers.length === 1 && typeof d.initializers[0] === 'function',
    'should compose "init"');
});

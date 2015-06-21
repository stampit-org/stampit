import stampit from '../src/stampit';
import test from 'tape';
import isArray from 'lodash/lang/isArray';

// Closure arguments

test('stamp.init() arguments are passed', (t) => {
  let initStamp = undefined;
  const outerStamp = stampit().init(({ instance, stamp, args }) => {
    t.ok(instance, 'opts.instance should exist');
    t.equal(typeof instance, 'object', 'opts.instance should be object');
    t.ok(stamp, 'opts.stamp should exist');
    t.equal(typeof stamp, 'function', 'opts.stamp should be function');
    t.ok(args, 'opts.args should exist');
    t.ok(isArray(args), 'opts.args should be array');
    initStamp = stamp;
  });

  outerStamp();

  t.strictEqual(outerStamp, initStamp, 'opts.stamp === stamp returned');

  t.end();
});

test('stamp.init() should assign `this` to `opts.instance`', (t) => {
  const stamp = stampit().init(function({ instance }) {
    t.ok(instance === this, 'opts.instance should equal `this`');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign stamp to `opts.stamp`', (t) => {
  const outerStamp = stampit().init(({ stamp }) => {
    t.ok(outerStamp === stamp, 'opts.stamp should equal stamp');
  });

  outerStamp();

  t.end();
});

test('stamp.init() should assign arguments to `opts.args`', (t) => {
  const stamp = stampit().init(({ args }) => {
    t.equal(args[0], 'arg1', 'opts.args should equal arguments');
    t.equal(args[1], undefined, 'opts.args should equal arguments');
    t.equal(args[2], 'arg3', 'opts.args should equal arguments');
  });

  stamp({}, 'arg1', undefined, 'arg3');

  t.end();
});

test('stamp.init() can handle multiple init functions', (t) => {
  let init1 = undefined;
  let init2 = undefined;
  let init3 = undefined;

  const stamp = stampit()
    .init(() => {
      init1 = true;
    }).init(() => {
      init2 = true;
    }).init(() => {
      init3 = true;
    });

  stamp();

  t.ok(init1, 'init 1 fired');
  t.ok(init2, 'init 2 fired');
  t.ok(init3, 'init 3 fired');

  t.end();
});

test('stamp.init() can handle multiple init functions assigned with array', (t) => {
  let init1 = undefined;
  let init2 = undefined;
  let init3 = undefined;

  const stamp = stampit().init([
    () => {
      init1 = true;
    },
    () => {
      init2 = true;
    },
    () => {
      init3 = true;
    }
  ]);

  stamp();

  t.ok(init1, 'init 1 fired');
  t.ok(init2, 'init 2 fired');
  t.ok(init3, 'init 3 fired');

  t.end();
});

test('stamp.init() can handle multiple init functions assigned with object', (t) => {
  let init1 = undefined;
  let init2 = undefined;
  let init3 = undefined;

  const stamp = stampit().init({
    foo() {
      init1 = true;
    },
    bar() {
      init2 = true;
    },
    bam() {
      init3 = true;
    }
  });

  stamp();

  t.ok(init1, 'init 1 fired');
  t.ok(init2, 'init 2 fired');
  t.ok(init3, 'init 3 fired');

  t.end();
});

test('stamp.init() should call composed init functions in order', (t) => {
  const result = [];

  const stamp = stampit().init(() => {
    result.push('a');
  }).init(() => {
    result.push('b');
  }).init(() => {
    result.push('c');
  });

  const stamp2 = stampit().init([
    () => {
      result.push('d');
    },
    () => {
      result.push('e');
    }
  ]);

  const stamp3 = stampit.compose(stamp, stamp2);

  stamp3();
  t.deepEqual(result, ['a', 'b', 'c', 'd', 'e'], 'init called in order');

  t.end();
});

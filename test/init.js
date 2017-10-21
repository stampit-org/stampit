import test from 'tape';
import stampit from '../src/stampit';

// Closure arguments

test('stamp.init() arguments are passed', (t) => {
  let initStamp;
  const outerStamp = stampit().init((options, {instance, stamp, args}) => {
    t.ok(instance, '{ instance } should exist');
    t.equal(typeof instance, 'object', '{ instance } should be object');
    t.ok(stamp, '{ stamp } should exist');
    t.equal(typeof stamp, 'function', '{ stamp } should be function');
    t.ok(args, '{ args } should exist');
    t.ok(Array.isArray(args), '{ args } should be array');
    initStamp = stamp;
  });

  outerStamp();

  t.strictEqual(outerStamp, initStamp, '{ stamp } === stamp returned');

  t.end();
});

test('stamp.init() should assign `this` to `{ instance }`', (t) => {
  const stamp = stampit().init(function (options, {instance}) {
    t.ok(instance === this, '{ instance } should equal `this`');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign stamp to `{ stamp }`', (t) => {
  const outerStamp = stampit().init((options, {stamp}) => {
    t.ok(outerStamp === stamp, '{ stamp } should equal stamp');
  });

  outerStamp();

  t.end();
});

test('stamp.init() should assign arguments to `{ args }`', (t) => {
  const stamp = stampit().init((options, {args}) => {
    t.equal(args[0], 'arg1', '{ args } should equal arguments');
    t.equal(args[1], undefined, '{ args } should equal arguments');
    t.equal(args[2], 'arg3', '{ args } should equal arguments');
  });

  stamp('arg1', undefined, 'arg3');

  t.end();
});

test('stamp.init() can handle multiple init functions', (t) => {
  let init1;
  let init2;
  let init3;

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
    }
  ]);

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

test('explicit push wrong object to stamp.compose.initializers[]', (t) => {
  const stamp = stampit({
    init() {
      const secret = 'foo';
      this.getSecret = () => { return secret; };
    }
  });

  stamp.compose.initializers.push(42); // breaking the stamp.
  const obj = stamp();

  t.equal(obj.getSecret(), 'foo', 'Should omit malformed compose.initializers[] elements.');

  t.end();
});

test('stamp.compose.initializers malformed object', (t) => {
  const stamp = stampit.props({ref: 42}).init(function () {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  });

  stamp.compose.initializers = 42; // breaking the stamp badly
  const obj = stamp();

  t.ok(obj.ref, 42, 'Should be okay with malformed compose.init.');

  t.end();
});

test('changing second arg is not propagaded', (t) => {
  const stamp = stampit().init((opts, arg2) => {
    arg2.instance = null;
    arg2.stamp = null;
    arg2.args = null;
  }).init((opts, arg2) => {
    t.notEqual(arg2.instance, null, '.instance was mutates');
    t.notEqual(arg2.stamp, null, '.stamp was mutates');
    t.notEqual(arg2.args, null, '.args was mutates');
  });

  stamp();

  t.end();
});

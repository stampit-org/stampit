import stampit from '../src/stampit';
import { test } from 'ava';
// Closure arguments

test('stamp.init() arguments are passed', (t) => {
  let initStamp = undefined;
  const outerStamp = stampit().init((options, { instance, stamp, args }) => {
    t.truthy(instance, '{ instance } should exist');
    t.is(typeof instance, 'object', '{ instance } should be object');
    t.truthy(stamp, '{ stamp } should exist');
    t.is(typeof stamp, 'function', '{ stamp } should be function');
    t.truthy(args, '{ args } should exist');
    t.truthy(Array.isArray(args), '{ args } should be array');
    initStamp = stamp;
  });

  outerStamp();

  t.truthy(outerStamp === initStamp, '{ stamp } === stamp returned');
});

test('stamp.init() should assign `this` to `{ instance }`', (t) => {
  const stamp = stampit().init(function(options, { instance }) {
    t.truthy(instance === this, '{ instance } should equal `this`');
  });

  stamp();
});

test('stamp.init() should assign stamp to `{ stamp }`', (t) => {
  const outerStamp = stampit().init((options, { stamp }) => {
    t.truthy(outerStamp === stamp, '{ stamp } should equal stamp');
  });

  outerStamp();
});

test('stamp.init() should assign arguments to `{ args }`', (t) => {
  const stamp = stampit().init((options, { args }) => {
    t.is(args[0], 'arg1', '{ args } should equal arguments');
    t.is(args[1], undefined, '{ args } should equal arguments');
    t.is(args[2], 'arg3', '{ args } should equal arguments');
  });

  stamp('arg1', undefined, 'arg3');
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

  t.truthy(init1, 'init 1 fired');
  t.truthy(init2, 'init 2 fired');
  t.truthy(init3, 'init 3 fired');
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

  t.truthy(init1, 'init 1 fired');
  t.truthy(init2, 'init 2 fired');
  t.truthy(init3, 'init 3 fired');
});

test('stamp.init() can handle multiple init functions assigned with object', (t) => {
  let init1;
  let init2;
  let init3;

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

  t.truthy(init1, 'init 1 fired');
  t.truthy(init2, 'init 2 fired');
  t.truthy(init3, 'init 3 fired');
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
});

test('explicit push wrong object to stamp.compose.initializers[]', (t) => {
  const stamp = stampit({ init() {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  }});

  stamp.compose.initializers.push(42); // breaking the stamp.
  const obj = stamp();

  t.is(obj.getSecret(), 'foo', 'Should omit malformed compose.initializers[] elements.');
});

test('stamp.compose.initializers malformed object', (t) => {
  const stamp = stampit.refs({ref: 42}).init(function() {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  });

  stamp.compose.initializers = 42; // breaking the stamp badly
  const obj = stamp();

  t.truthy(obj.ref, 42, 'Should be okay with malformed compose.init.');
});

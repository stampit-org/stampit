import test from 'tape';
import _ from 'lodash';
import stampit from '../src/stampit';

// composers

test('stampit({ composers() })', (t) => {
  let executed = 0;
  let passedStamp;
  const stamp = stampit({
    composers(...args) {
      t.equal(args.length, 1, 'have single argument');
      t.ok(_.isPlainObject(args[0]), 'argument is an object');
      t.ok(_.isArray(args[0].composables), 'composables passed');
      t.equal(args[0].composables.length, 1, 'only one composable passed');
      t.ok(_.isPlainObject(args[0].composables[0]), 'the composable is a descriptor');
      t.ok(_.isArray(args[0].composables[0].composers),
        'first composable have the composers list');
      executed += 1;
      passedStamp = args[0].stamp;
    }
  });

  t.ok(stamp.compose.composers,
    'should add composers');
  t.equal(stamp.compose.composers.length, 1,
    'should be single composer');
  t.equal(executed, 1,
    'should be executed while composing');
  t.equal(passedStamp, stamp, 'stamp passed');

  t.end();
});

test('stampit({ composers: function[] })', (t) => {
  let executed1 = 0;
  let executed2 = 0;
  let stamp1;
  let stamp2;
  const actualStamp = stampit({
    composers: [
      function composer1({stamp}) {
        stamp1 = stamp;
        executed1 += 1;
      },
      function composer2({stamp}) {
        stamp2 = stamp;
        executed2 += 1;
      }
    ]
  });

  t.equal(stamp1, actualStamp, 'stamp passed to first composer');
  t.equal(stamp2, actualStamp, 'stamp passed to second composer');
  t.equal(executed1, 1, 'first composer executed');
  t.equal(executed2, 1, 'second composer executed');

  t.end();
});

test('stampit({ composers() }).compose({ composers() })', (t) => {
  let executed1 = 0;
  let executed2 = 0;
  let stamp1;
  let stamp2;
  const actualStamp = stampit({
    composers({stamp}) {
      stamp1 = stamp;
      executed1 += 1;
    }
  })
    .compose({
      composers({stamp}) {
        stamp2 = stamp;
        executed2 += 1;
      }
    });

  t.equal(stamp1, actualStamp, 'stamp passed to first composer');
  t.equal(stamp2, actualStamp, 'stamp passed to second composer');
  t.equal(executed1, 2, 'first composer executed twice');
  t.equal(executed2, 1, 'second composer executed');

  t.end();
});

test('stampit({ composers() }) returned value replaces stamp', (t) => {
  const replacement = stampit();
  const stamp = stampit({
    composers() {
      return replacement;
    }
  });

  t.equal(stamp, replacement, 'composer returned value should replace original stamp');

  t.end();
});

test('stampit({ composers() }) a non-stamp should be ignored', (t) => {
  const replacement = stampit();
  const stamp = stampit({
    composers() {
      return () => {}; // non-stamp
    }
  });

  t.notEqual(stamp, replacement, 'composer returned value should not replace original stamp');

  t.end();
});

test('stampit({ composers() }) returned value passed to the second composer', (t) => {
  const replacement = stampit();
  let stamp2;
  stampit({
    composers() {
      return replacement;
    }
  }, {
    composers() {
      stamp2 = replacement;
    }
  });

  t.equal(stamp2, replacement, 'second composer should get first composer return value');

  t.end();
});

test('composers should be deduped', (t) => {
  const stamp2 = stampit();
  const stamp = stampit({composers() {}});

  const result = stamp.compose(stamp2).compose({}).compose(stamp);
  const composers = result.compose.composers;
  t.equal(composers.length, 1, 'should dedupe composers');

  t.end();
});

test('stamp.compose({ composers() }) passes full composables array', (t) => {
  let run = 0;
  const stamp2 = stampit();
  const stamp = stampit({
    composers({composables}) {
      run += 1;
      if (run === 1) {
        t.equal(composables.length, 1, 'creating stamp should pass one composable');
      }
      if (run === 2) {
        t.equal(composables.length, 2, 'inheriting stamp should pass two composables');
        t.equal(composables[0], stamp, 'first composable must be stamp itself');
        t.equal(composables[1], stamp2, 'second composable must be passed');
      }
    }
  });

  stamp.compose(stamp2);

  t.equal(run, 2, 'should invoke composer twice');

  t.end();
});

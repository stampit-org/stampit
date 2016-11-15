import test from 'tape';
import _ from 'lodash';
import stampit from '../src/stampit';

// composers

test('stampit({ composers() })', (t) => {
  let executed = 0;
  let passedStamp = null;
  const stamp = stampit({
    composers() {
      t.equal(arguments.length, 1, 'have single argument');
      t.ok(_.isPlainObject(arguments[0]), 'argument is an object');
      passedStamp = arguments[0].stamp;
      t.ok(_.isArray(arguments[0].composables), 'composables passed');
      t.equal(arguments[0].composables.length, 1, 'only one composable passed');
      t.ok(_.isPlainObject(arguments[0].composables[0]), 'the composable is a descriptor');
      t.ok(_.isPlainObject(arguments[0].composables[0].deepConfiguration),
        'composable was converted to standard descriptor');
      t.ok(_.isArray(arguments[0].composables[0].deepConfiguration.composers),
        'first composable have the composers list');
      executed += 1;
    }
  });

  t.ok(stamp.compose.deepConfiguration,
    'should add deepConfiguration');
  t.ok(stamp.compose.deepConfiguration.composers,
    'should add deepConfiguratuin.composers');
  t.equal(stamp.compose.deepConfiguration.composers.length, 1,
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


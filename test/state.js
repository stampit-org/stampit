import stampit from '../src/stampit';
import { test } from 'ava';
// .properties alias

test('stampit().compose.properties is same as refs', (t) => {
  const stamp = stampit({ refs: { s: 1 } });

  t.is(stamp.compose.properties, stamp.compose.properties);
});

test('stampit().properties().compose.properties is same as refs().compose.properties', (t) => {
  const stamp = stampit({ refs: { s: 1 } }).properties({ refs: { s2: 2 } });

  t.is(stamp.compose.properties, stamp.compose.properties);
  t.is(stamp.compose.properties.s, stamp.compose.properties.s);
  t.is(stamp.compose.properties.s2, stamp.compose.properties.s2);
});

test('stampit.compose().compose.properties is same as refs', (t) => {
  const stamp = stampit({ refs: { s: 1 } }).compose(stampit({ refs: { s2: 2 } }));

  t.is(stamp.compose.properties, stamp.compose.properties);
});

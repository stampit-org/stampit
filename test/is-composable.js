import test from 'tape';
import stampit from '../src/stampit';
import isComposable from '../src/isComposable';

// isComposable

test('isComposable() with objects', (t) => {
  const emptyStamp = stampit();

  t.ok(isComposable(emptyStamp), 'Empty stamp should be seen as composable.');
  t.ok(isComposable(emptyStamp.compose), 'stamp.compose should be seen as composable.');
  t.ok(isComposable({}), 'An object should be seen as composable.');
  t.ok(isComposable(() => {}), 'A function should be seen as composable.');

  t.end();
});

test('isComposable() with non objects', (t) => {
  const obj1 = undefined;
  const obj2 = 4;
  const obj3 = 'a string';
  const obj4 = null;

  t.notOk(isComposable(obj1), 'Should not be seen as composable.');
  t.notOk(isComposable(obj2), 'Should not be seen as composable.');
  t.notOk(isComposable(obj3), 'Should not be seen as composable.');
  t.notOk(isComposable(obj4), 'Should not be seen as composable.');

  t.end();
});

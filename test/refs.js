import stampit from '../src/stampit';
import { test } from 'ava';
// Refs shallow mixing

test('Stamp refs shallow copied for object created', (t) => {
  const deep = { foo: 'foo', bar: 'bar' };
  const stamp1 = stampit().refs({ deep: deep, foo: 'foo' });
  const stamp2 = stampit({ refs: { deep: deep, foo: 'foo' } });

  const o1 = stamp1();
  const o2 = stamp2();
  o1.deep.foo = 'another value';
  t.is(o1.foo, o2.foo);
  t.is(o1.deep, o2.deep);
  t.is(o1.deep.foo, o2.deep.foo);
});

test('stampit.refs(refs) shallow copied into stamp', (t) => {
  const stamp = stampit()
    .refs({ deep: { foo: '1', bar: '1' }, foo: '1', bar: '1' })
    .refs({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  const o = stamp();

  t.is(o.foo, 'override');
  t.is(o.bar, '1');
  t.is(o.baz, 'baz');
  t.is(o.deep.foo, 'override');
  t.is(o.deep.bar, undefined);
  t.is(o.deep.baz, 'baz');
});

test('stamp.compose() shallow copy refs', (t) => {
  const stamp = stampit({ refs: { deep: { foo: '1', bar: '1' }, foo: '1', bar: '1' } })
    .compose(stampit({ refs: { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' } }));
  const o = stamp();

  t.is(o.foo, 'override');
  t.is(o.bar, '1');
  t.is(o.baz, 'baz');
  t.is(o.deep.foo, 'override');
  t.is(o.deep.bar, undefined);
  t.is(o.deep.baz, 'baz');
});

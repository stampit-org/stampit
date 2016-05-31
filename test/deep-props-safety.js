import stampit from '../src/stampit';
import { test } from 'ava';
// Props safety

test('Stamp deepProps deep cloned for object created', (t) => {
  const deep = { foo: 'foo', bar: 'bar' };
  const stamp1 = stampit().deepProps({ deep: deep, foo: 'foo' });
  const stamp2 = stampit({ deepProps: { deep: deep, foo: 'foo' } });

  let o1 = stamp1();
  let o2 = stamp1();
  o1.foo = 'another value';
  t.not(o1.foo, o2.foo);
  o1.deep.foo = 'another value';
  t.not(o1.deep.foo, o2.deep.foo);

  o1 = stamp2();
  o2 = stamp2();
  o1.foo = 'another value';
  t.not(o1.foo, o2.foo);
  o1.deep.foo = 'another value';
  t.not(o1.deep.foo, o2.deep.foo);
});

test('stampit.deepProps(deepProps) deep merge into stamp', (t) => {
  const stamp = stampit()
    .deepProps({ deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .deepProps({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  const o = stamp();

  t.is(o.foo, 'override');
  t.is(o.bar, 'bar');
  t.is(o.baz, 'baz');
  t.is(o.deep.foo, 'override');
  t.is(o.deep.bar, 'bar');
  t.is(o.deep.baz, 'baz');
});

test('stamp.compose() deep merge deepProps', (t) => {
  const stamp = stampit({ deepProps: { deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' } })
    .compose(stampit({ deepProps: { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' } }));
  const o = stamp();

  t.is(o.foo, 'override');
  t.is(o.bar, 'bar');
  t.is(o.baz, 'baz');
  t.is(o.deep.foo, 'override');
  t.is(o.deep.bar, 'bar');
  t.is(o.deep.baz, 'baz');
});

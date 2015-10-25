import stampit from '../src/stampit';
import test from 'tape';

// Props safety

test('Stamp deepProps deep cloned for object created', (t) => {
  const deep = { foo: 'foo', bar: 'bar' };
  const stamp1 = stampit().deepProps({ deep: deep, foo: 'foo' });
  const stamp2 = stampit({ deepProps: { deep: deep, foo: 'foo' } });

  let o1 = stamp1();
  let o2 = stamp1();
  o1.foo = 'another value';
  t.notEqual(o1.foo, o2.foo);
  o1.deep.foo = 'another value';
  t.notEqual(o1.deep.foo, o2.deep.foo);

  o1 = stamp2();
  o2 = stamp2();
  o1.foo = 'another value';
  t.notEqual(o1.foo, o2.foo);
  o1.deep.foo = 'another value';
  t.notEqual(o1.deep.foo, o2.deep.foo);

  t.end();
});

test('stamp(refs) does not deep merges deepProps into refs', (t) => {
  const deepInProps = { deepProp1: 'should not be merged', deepProp2: 'do not merge me!' };
  const stamp1 = stampit().deepProps({ deep: deepInProps, shallow1: 'should not be merged', shallow2: 'merge me!' });
  const stamp2 = stampit({ deepProps: { deep: deepInProps, shallow1: 'should not be merged', shallow2: 'merge me!' } });

  const o1 = stamp1({ deep: { deepProp1: 'leave me as is' }, shallow1: 'leave me as is' });
  const o2 = stamp2({ deep: { deepProp1: 'leave me as is' }, shallow1: 'leave me as is' });

  t.equal(o1.shallow1, 'leave me as is', 'A conflicting shallow reference must not be touched by deepProps');
  t.equal(o1.shallow2, 'merge me!', 'A non conflicting shallow reference must be merged from deepProps');
  t.equal(o2.shallow1, 'leave me as is', 'A conflicting shallow reference must not be touched by deepProps');
  t.equal(o2.shallow2, 'merge me!', 'A non conflicting shallow reference must be merged from deepProps');
  t.equal(o1.deep.deepProp1, 'leave me as is', 'A conflicting deep property in refs must not be touched by deepProps');
  t.equal(o1.deep.deepProp2, undefined, 'A non conflicting deep property must be merged from deepProps');
  t.equal(o2.deep.deepProp1, 'leave me as is', 'A conflicting deep property in refs must not be touched by deepProps');
  t.equal(o2.deep.deepProp2, undefined, 'A non conflicting deep property must be merged from deepProps');

  t.end();
});

test('stampit.deepProps(deepProps) deep merge into stamp', (t) => {
  const stamp = stampit()
    .deepProps({ deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .deepProps({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

test('stamp.compose() deep merge deepProps', (t) => {
  const stamp = stampit({ deepProps: { deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' } })
    .compose(stampit({ deepProps: { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' } }));
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

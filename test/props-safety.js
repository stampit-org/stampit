import stampit from '../src/stampit';
import test from 'tape';

// Props safety

test('Stamp props deep cloned for object created', (t) => {
  const deep = { foo: 'foo', bar: 'bar' };
  const stamp1 = stampit().props({ deep: deep, foo: 'foo' });
  const stamp2 = stampit({ props: { deep: deep, foo: 'foo' } });

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

test('stamp(refs) deep merges props into refs', (t) => {
  const deepInProps = { deepProp1: 'should not be merged', deepProp2: 'merge me!' };
  const stamp1 = stampit().props({ deep: deepInProps, shallow1: 'should not be merged', shallow2: 'merge me!' });
  const stamp2 = stampit({ props: { deep: deepInProps, shallow1: 'should not be merged', shallow2: 'merge me!' } });

  const o1 = stamp1({ deep: { deepProp1: 'leave me as is' }, shallow1: 'leave me as is' });
  const o2 = stamp2({ deep: { deepProp1: 'leave me as is' }, shallow1: 'leave me as is' });

  t.equal(o1.shallow1, 'leave me as is', 'A conflicting shallow reference must not be touched by props');
  t.equal(o1.shallow2, 'merge me!', 'A non conflicting shallow reference must be merged from props');
  t.equal(o2.shallow1, 'leave me as is', 'A conflicting shallow reference must not be touched by props');
  t.equal(o2.shallow2, 'merge me!', 'A non conflicting shallow reference must be merged from props');
  t.equal(o1.deep.deepProp1, 'leave me as is', 'A conflicting deep property in refs must not be touched by props');
  t.equal(o1.deep.deepProp2, 'merge me!', 'A non conflicting deep property must be merged from props');
  t.equal(o2.deep.deepProp1, 'leave me as is', 'A conflicting deep property in refs must not be touched by props');
  t.equal(o2.deep.deepProp2, 'merge me!', 'A non conflicting deep property must be merged from props');

  t.end();
});

test('stampit.props(props) deep merge into stamp', (t) => {
  const stamp = stampit()
    .props({ deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .props({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

test('stamp.compose() deep merge props', (t) => {
  const stamp = stampit({ props: { deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' } })
    .compose(stampit({ props: { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' } }));
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

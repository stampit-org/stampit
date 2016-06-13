import stampit from '../src/stampit';
import test from 'tape';

// Props safety

test('Stamp deepProps deep cloned for object created', (t) => {
  const deep = {foo: 'foo', bar: 'bar'};
  const stamp1 = stampit().deepProps({deep: deep, foo: 'foo'});
  const stamp2 = stampit({deepProps: {deep: deep, foo: 'foo'}});

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

test('stampit.deepProps(deepProps) deep merge into stamp', (t) => {
  const stamp = stampit()
    .deepProps({deep: {foo: 'foo', bar: 'bar'}, foo: 'foo', bar: 'bar'})
    .deepProps({
      deep: {foo: 'override', baz: 'baz'},
      foo: 'override',
      baz: 'baz'
    });
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
  const stamp = stampit({
    deepProps: {
      deep: {foo: 'foo', bar: 'bar'},
      foo: 'foo',
      bar: 'bar'
    }
  })
    .compose(stampit({
      deepProps: {
        deep: {foo: 'override', baz: 'baz'},
        foo: 'override',
        baz: 'baz'
      }
    }));
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

import test from 'tape';
import stampit from '../src/stampit';

// props shallow mixing

test('Stamp props shallow copied for object created', (t) => {
  const deep = {foo: 'foo', bar: 'bar'};
  const stamp1 = stampit().props({deep: deep, foo: 'foo'});
  const stamp2 = stampit({props: {deep: deep, foo: 'foo'}});

  const o1 = stamp1();
  const o2 = stamp2();
  o1.deep.foo = 'another value';
  t.equal(o1.foo, o2.foo);
  t.equal(o1.deep, o2.deep);
  t.equal(o1.deep.foo, o2.deep.foo);

  t.end();
});

test('stampit.props(props) shallow copied into stamp', (t) => {
  const stamp = stampit()
    .props({deep: {foo: '1', bar: '1'}, foo: '1', bar: '1'})
    .props({deep: {foo: 'override', baz: 'baz'}, foo: 'override', baz: 'baz'});
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, '1');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, undefined);
  t.equal(o.deep.baz, 'baz');

  t.end();
});

test('stamp.compose() shallow copy props', (t) => {
  const stamp = stampit({
    props: {
      deep: {foo: '1', bar: '1'},
      foo: '1',
      bar: '1'
    }
  })
    .compose(stampit({
      props: {
        deep: {foo: 'override', baz: 'baz'},
        foo: 'override',
        baz: 'baz'
      }
    }));
  const o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, '1');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, undefined);
  t.equal(o.deep.baz, 'baz');

  t.end();
});

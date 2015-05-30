'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Props safety

test('Stamp props deep cloned for object created', function (t) {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().props({ deep: deep, foo: 'foo' });
  var stamp2 = stampit({ props: { deep: deep, foo: 'foo' } });

  var o1 = stamp1();
  var o2 = stamp1();
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

test('stamp(props) deep merge into object created', function (t) {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().props({ deep: deep, foo: 'foo', bar: 'bar' });
  var stamp2 = stampit({ props: { deep: deep, foo: 'foo', bar: 'bar' } });

  var deep2 = { foo: 'override', baz: 'baz' };
  var o1 = stamp1({ deep: deep2, foo: 'override', baz: 'baz' });
  var o2 = stamp2({ deep: deep2, foo: 'override', baz: 'baz' });

  t.equal(o1.foo, 'override');
  t.equal(o1.bar, 'bar');
  t.equal(o1.baz, 'baz');
  t.equal(o2.foo, 'override');
  t.equal(o2.bar, 'bar');
  t.equal(o2.baz, 'baz');
  t.equal(o1.deep.foo, 'override');
  t.equal(o1.deep.bar, 'bar');
  t.equal(o1.deep.baz, 'baz');
  t.equal(o2.deep.foo, 'override');
  t.equal(o2.deep.bar, 'bar');
  t.equal(o2.deep.baz, 'baz');

  t.end();
});

test('stampit.props(props) deep merge into stamp', function (t) {
  var stamp = stampit()
    .props({ deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .props({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  var o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

test('stamp.compose() deep merge props', function (t) {
  var stamp = stampit({ props: { deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' } })
    .compose(stampit({ props: { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' } }));
  var o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

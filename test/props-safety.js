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

test('stamp(refs) deep merges props into refs', function (t) {
  var deepInProps = { deepProp1: 'should not be merged', deepProp2: 'merge me!' };
  var stamp1 = stampit().props({ deep: deepInProps, shallow1: 'should not be merged', shallow2: 'merge me!' });
  var stamp2 = stampit({ props: { deep: deepInProps, shallow1: 'should not be merged', shallow2: 'merge me!' } });

  var o1 = stamp1({ deep: { deepProp1: 'leave me as is' }, shallow1: 'leave me as is' });
  var o2 = stamp2({ deep: { deepProp1: 'leave me as is' }, shallow1: 'leave me as is' });

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

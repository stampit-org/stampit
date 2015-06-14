'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Refs shallow mixing

test('Stamp refs shallow copied for object created', function (t) {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().refs({ deep: deep, foo: 'foo' });
  var stamp2 = stampit({ refs: { deep: deep, foo: 'foo' } });

  var o1 = stamp1();
  var o2 = stamp2();
  o1.deep.foo = 'another value';
  t.equal(o1.foo, o2.foo);
  t.equal(o1.deep, o2.deep);
  t.equal(o1.deep.foo, o2.deep.foo);

  t.end();
});

test('stampit.refs(refs) shallow copied into stamp', function (t) {
  var stamp = stampit()
    .refs({ deep: { foo: '1', bar: '1' }, foo: '1', bar: '1' })
    .refs({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  var o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, '1');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, undefined);
  t.equal(o.deep.baz, 'baz');

  t.end();
});

test('stamp.compose() shallow copy refs', function (t) {
  var stamp = stampit({ refs: { deep: { foo: '1', bar: '1' }, foo: '1', bar: '1' } })
    .compose(stampit({ refs: { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' } }));
  var o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, '1');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, undefined);
  t.equal(o.deep.baz, 'baz');

  t.end();
});

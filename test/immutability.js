'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Immutability

test('Basic stamp immutability', function (t) {
  var methods = { f: function F1() {} };
  var refs = { s: { deep: 1 } };
  var props = { p: { deep: 1 } };
  var stamp1 = stampit(methods, refs, null, props);

  methods.f = function F2() {};
  refs.s.deep = 2;
  props.p.deep = 2;
  var stamp2 = stampit(methods, refs, null, props);

  t.notEqual(stamp1.fixed.methods, stamp2.fixed.methods);
  t.notEqual(stamp1.fixed.methods.f, stamp2.fixed.methods.f);
  t.notEqual(stamp1.fixed.refs, stamp2.fixed.refs);
  t.equal(stamp1.fixed.refs.s, stamp2.fixed.refs.s);
  t.equal(stamp1.fixed.refs.s.deep, stamp2.fixed.refs.s.deep);
  t.notEqual(stamp1.fixed.props, stamp2.fixed.refs);
  t.notEqual(stamp1.fixed.props.p, stamp2.fixed.props.p);
  t.notEqual(stamp1.fixed.props.p.deep, stamp2.fixed.props.p.deep);
  t.notEqual(stamp1.fixed.init, stamp2.fixed.init);

  t.end();
});

test('Stamp immutability made of same source', function (t) {
  var methods = { f: function F1() {} };
  var refs = { s: { deep: 1 } };
  var props = { p: { deep: 1 } };
  var stamp1 = stampit(methods, refs, null, props);
  var stamp2 = stampit(methods, refs, null, props);

  t.notEqual(stamp1.fixed.methods, stamp2.fixed.methods);
  t.notEqual(stamp1.fixed.refs, stamp2.fixed.refs);
  t.equal(stamp1.fixed.refs.s, stamp2.fixed.refs.s);
  t.notEqual(stamp1.fixed.props, stamp2.fixed.props);
  t.notEqual(stamp1.fixed.props.p, stamp2.fixed.props.p);
  t.notEqual(stamp1.fixed.init, stamp2.fixed.init);

  t.end();
});

test('Basic object immutability', function (t) {
  var methods = { f: function F1() {} };
  var refs = { s: { deep: 1 } };
  var props = { p: { deep: 1 } };
  var o1 = stampit(methods, refs, null, props)();

  methods.f = function F2() {};
  refs.s.deep = 2;
  props.p.deep = 2;
  var o2 = stampit(methods, refs, null, props)();

  t.notEqual(o1, o2);
  t.notEqual(o1.f, o2.f);
  t.equal(o1.s, o2.s);
  t.equal(o1.s.deep, o2.s.deep);
  t.notEqual(o1.p, o2.p);
  t.notEqual(o1.p.deep, o2.p.deep);

  t.end();
});

test('Stamp chaining functions immutability', function (t) {
  var stamp1 = stampit();
  var stamp2 = stamp1.methods({ f: function F1() {} });
  var stamp3 = stamp2.refs( { s: { deep: 1 } });
  var stamp4 = stamp3.init(function () { });
  var stamp5 = stamp2.props( { p: { deep: 1 } });
  var stamp6 = stamp4.compose(stampit());

  t.notEqual(stamp1, stamp2);
  t.notEqual(stamp2, stamp3);
  t.notEqual(stamp3, stamp4);
  t.notEqual(stamp4, stamp5);
  t.notEqual(stamp5, stamp6);

  t.end();
});

'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// stampit.methods, stampit.refs, stampit.init, stampit.props

test('stampit.methods shortcut', function (t) {
  var methods = { method1: function(){} };
  var stamp1 = stampit({ methods: methods });
  var stamp2 = stampit.methods(methods);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.refs shortcut', function (t) {
  var refs = { method1: function(){} };
  var stamp1 = stampit({ refs: refs });
  var stamp2 = stampit.refs(refs);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.init shortcut', function (t) {
  var init = { method1: function(){} };
  var stamp1 = stampit({ init: init });
  var stamp2 = stampit.init(init);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.props shortcut', function (t) {
  var props = { method1: function(){} };
  var stamp1 = stampit({ props: props });
  var stamp2 = stampit.props(props);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

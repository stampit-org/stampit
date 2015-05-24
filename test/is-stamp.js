'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// isStamp

test('stampit.isStamp() with stamps', function (t) {
  var emptyStamp = stampit();
  var refsOnlyStamp = stampit().refs({ a: 'b' });
  var methodsOnlyStamp = stampit({
    method: function () {}
  });
  var closureOnlyStamp = stampit().enclose(function () {});

  t.ok(stampit.isStamp(emptyStamp), 'Empty stamp should be seen as stamp.');
  t.ok(stampit.isStamp(refsOnlyStamp), 'Refs only stamp should be seen as stamp.');
  t.ok(stampit.isStamp(methodsOnlyStamp), 'Methods only stamp should be seen as stamp.');
  t.ok(stampit.isStamp(closureOnlyStamp), 'Closure only stamp should be seen as stamp.');

  t.end();
});

test('stampit.isStamp() with non stamps', function (t) {
  var obj1;
  var obj2 = { refs: {}, methods: {}, enclose: {}, fixed: {}, props: {} };
  var obj3 = function () {
    this.enclose = this;
  };
  var obj4 = function () {
    this.fixed = function () { };
  };

  t.ok(!stampit.isStamp(obj1) && !stampit.isStamp(obj2) && !stampit.isStamp(obj3) && !stampit.isStamp(obj4),
    'Should not be seen as stamp.');

  t.end();
});

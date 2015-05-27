'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Stampit v1 compatibility

var stamp = {
  fixed: {
    methods: {},
    state: {s: 1},
    enclose: []
  }
};

test('stampit.compose(stamp1, stamp2) is v1 compatible', function (t) {
  var composed1 = stampit.compose(stampit(), stamp);
  var composed2 = stampit.compose(stamp, stampit());

  t.equal(composed1.fixed.state.s, 1);
  t.equal(composed2.fixed.state.s, 1);

  t.end();
});

test('stampit().compose(stamp) is v1 compatible', function (t) {
  var composed = stampit().compose(stamp);

  t.equal(composed.fixed.state.s, 1);

  t.end();
});

test('stampit.isStamp() with legacy stamps', function (t) {
  var emptyStamp = stampit();
  delete emptyStamp.fixed.refs;
  var refsOnlyStamp = stampit().refs({a: 'b'});
  delete refsOnlyStamp.fixed.refs;
  var methodsOnlyStamp = stampit({
    method: function () {
    }
  });
  delete methodsOnlyStamp.fixed.refs;
  var closureOnlyStamp = stampit().enclose(function () {
  });
  delete closureOnlyStamp.fixed.refs;

  t.ok(stampit.isStamp(emptyStamp), 'Empty legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(refsOnlyStamp), 'Refs only legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(methodsOnlyStamp), 'Methods only legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(closureOnlyStamp), 'Closure only legacy stamp should be seen as stamp.');

  t.end();
});

test('stamp.init() with legacy stamps', function (t) {
  try {
    var stamp = stampit().enclose(function () {
      this.called = true;
    });
    delete stamp.fixed.init;

    var instance1 = stampit().compose(stamp).create();
    var instance2 = stamp.compose(stampit()).create();

    t.ok(instance1.called, 'New stamp should compose enclosures with legacy.');
    t.ok(instance2.called, 'Legacy stamp should compose enclosures with new.');
  }
  catch (e) {
    console.error(e.stack);
  }
  t.end();
});

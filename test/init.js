'use strict';
var stampit = require('../stampit'),
  test = require('tape'),
  isArray = require('lodash/lang/isArray');

// Closure arguments

test('stamp.init() arguments are passed', function (t) {

  var initStamp;
  var stamp = stampit().init(function (opts) {
    t.ok(opts, 'opts should be passed to init()');
    t.ok(opts.instance, 'opts.instance should exist');
    t.equal(typeof opts.instance, 'object', 'opts.instance should be object');
    t.strictEqual(opts.instance, this, 'opts.instance === this');
    t.ok(opts.stamp, 'opts.stamp should exist');
    t.equal(typeof opts.stamp, 'function', 'opts.stamp should be function');
    t.ok(opts.args, 'opts.args should exist');
    t.ok(isArray(opts.args), 'opts.args should be array');
    initStamp = opts.stamp;
  });

  stamp();

  t.strictEqual(stamp, initStamp, 'opts.stamp === stamp returned');

  t.end();
});

test('stamp.init() should assign `this` to `opts.instance`', function (t) {
  var stamp = stampit().init(function (opts) {
    t.ok(opts.instance === this, 'opts.instance should equal `this`');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign stamp to `opts.stamp`', function (t) {
  var stamp = stampit().init(function (opts) {
    t.ok(opts.stamp === stamp, 'opts.stamp should equal stamp');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign arguments to `opts.args`', function (t) {
  var stamp = stampit().init(function (opts) {
    t.equal(opts.args[0], 'arg1', 'opts.args should equal arguments');
    t.equal(opts.args[1], undefined, 'opts.args should equal arguments');
    t.equal(opts.args[2], 'arg3', 'opts.args should equal arguments');
  });

  stamp({}, 'arg1', undefined, 'arg3');

  t.end();
});

test('stamp.init() can handle multiple init functions', function (t) {

    var init1;
    var init2;
    var init3;

    var stamp = stampit()
        .init(function () {
            init1 = true;
        }).init(function () {
            init2 = true;
        }).init(function () {
            init3 = true;
        });

    stamp();

    t.ok(init1, 'init 1 fired');
    t.ok(init2, 'init 2 fired');
    t.ok(init3, 'init 3 fired');

  t.end();
});

test('stamp.init() can handle multiple init functions assigned with array', function (t) {

    var init1;
    var init2;
    var init3;

    var stamp = stampit().init([
        function () {
            init1 = true;
        },
        function () {
            init2 = true;
        },
        function () {
            init3 = true;
        }
    ]);

    stamp();

    t.ok(init1, 'init 1 fired');
    t.ok(init2, 'init 2 fired');
    t.ok(init3, 'init 3 fired');

  t.end();
});

test('stamp.init() can handle multiple init functions assigned with object', function (t) {

    var init1;
    var init2;
    var init3;

    var stamp = stampit().init({
        foo: function () {
            init1 = true;
        },
        bar: function () {
            init2 = true;
        },
        bam: function () {
            init3 = true;
        }
    });

    stamp();

    t.ok(init1, 'init 1 fired');
    t.ok(init2, 'init 2 fired');
    t.ok(init3, 'init 3 fired');

  t.end();
});

test('stamp.init() should call composed init functions in order', function (t) {

    var result = [];

    var stamp = stampit().init(function () {
        result.push('a');
    }).init(function () {
        result.push('b');
    }).init(function () {
        result.push('c');
    });

    var stamp2 = stampit().init([
        function(){
            result.push('d');
        },
        function(){
            result.push('e');
        }
    ]);

    var stamp3 = stampit.compose(stamp, stamp2);

    stamp3();
    t.deepEqual(result, ['a', 'b', 'c', 'd', 'e'], 'init called in order');

  t.end();
});

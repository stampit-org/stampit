'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Oldskool

test('stampit.convertConstructor()', function (t) {
  var Base = function () { this.base = 'base'; };
  Base.prototype.baseFunc = function () { return 'baseFunc'; };

  var Constructor = function Constructor() { this.thing = 'initialized'; };
  Constructor.staticFunc = function () {};
  Constructor.staticProp = 'static';
  Constructor.prototype = new Base();
  Constructor.prototype.foo = function foo() { return 'foo'; };

  var oldskool = stampit.convertConstructor(Constructor);
  var obj = oldskool();

  t.equal(obj.thing, 'initialized',
    'Constructor should execute.');

  t.equal(obj.staticFunc, undefined,
    'Non prototype functions should not be mixed in.');

  t.equal(obj.staticProp, undefined,
    'Non prototype properties should not be mixed in.');

  t.equal(obj.foo && obj.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.equal(obj.base, 'base',
    'Prototype property should be mixed in.');

  t.equal(obj.baseFunc && obj.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.end();
});

test('stampit.convertConstructor() composed', function (t) {
  // The old constructor / class thing...
  var BaseOfBase = function () { this.baseOfBase = 'baseOfBase'; };
  BaseOfBase.prototype.baseOfBaseFunc = function () { return 'baseOfBaseFunc'; };

  var Base = function () { this.base = 'base'; };
  Base.prototype = new BaseOfBase();
  Base.prototype.baseFunc = function () { return 'baseFunc'; };

  var Constructor = function Constructor() {
    this.thing = 'initialized';
  };
  Constructor.prototype = new Base();
  Constructor.prototype.foo = function foo() { return 'foo'; };

  // The conversion
  var oldskool = stampit.convertConstructor(Constructor);

  // A new stamp to compose with...
  var newskool = stampit().methods({
    bar: function bar() { return 'bar'; }
    // your methods here...
  }).init(function () {
    this.baz = 'baz';
  });

  // Now you can compose those old constructors just like you could
  // with any other factory...
  var myThing = stampit.compose(oldskool, newskool);
  var myThing2 = stampit.compose(newskool, oldskool);

  var thing = myThing();
  var u = myThing2();

  t.equal(thing.thing, 'initialized',
    'Constructor should execute.');

  t.equal(thing.foo && thing.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.equal(thing.base, 'base',
    'Prototype property should be mixed in.');

  t.equal(thing.baseFunc && thing.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.equal(thing.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  t.equal(thing.baseOfBaseFunc && thing.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  t.equal(thing.bar && thing.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  t.equal(thing.baz, 'baz',
    'Should be able to add new methods with .compose()');

  t.equal(u.thing, 'initialized',
    'Constructor should execute.');

  t.equal(u.foo && u.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.equal(u.base, 'base',
    'Prototype property should be mixed in.');

  t.equal(u.baseFunc && u.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.equal(u.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  t.equal(u.baseOfBaseFunc && u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  t.equal(u.bar && u.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  t.equal(u.baz, 'baz',
    'Should be able to add new methods with .compose()');

  t.equal(u.baseOfBaseFunc && u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype chain function should be mixed in.');

  t.end();
});

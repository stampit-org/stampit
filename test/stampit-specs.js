'use strict';
/*global test, equal, ok, stampit, notEqual*/

module('Basics');

test('stampit()', function () {
  equal(typeof stampit(), 'function',
    'Should produce a function.');
});

test('.create()', function () {
  var stamp = stampit({
    foo: function () { return 'foo'; }
  });

  equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');
});

test('.create(properties)', function () {
  var obj = stampit({}, { foo: 'bar' });
  obj = obj.create({ foo: 'foo' });
  
  equal(obj.foo, 'foo',
    'should override defaults.');
});

module('Basics Methods');

test('stampit(methods)', function () {
  var obj = stampit({
    foo: function () { return 'foo'; }
  }).create();
  
  ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
});

test('stampit().methods()', function () {
  var obj = stampit({
    foo: function () { return 'foo'; },
    methodOverride: function () { return false; },
    prop1: 1
  }).methods({
    bar: function () { return 'bar'; },
    methodOverride: function () { return true; },
    prop2: 2
  }).create();

  ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  ok(!obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');
  ok(!obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');
});

test('stampit().methods(a, b)', function () {
  var obj = stampit().methods({
    a: function () { return 'a'; }
  }, {
    b: function () { return 'b'; }
  }).create();

  ok(obj.a() === 'a' && obj.b() === 'b',
    'Should mixIn objects when multiple methods are passed.');
});

module('Basics State');

test('stampit({}, state)', function () {
  var obj = stampit({}, { foo: { bar: 'bar' } }).create();
  
  equal(obj.foo.bar, 'bar',
    'Should set default state.');
});

test('stampit().state()', function () {
  var obj = stampit(null, {
    foo: { bar: 'bar' },
    stateOverride: false,
    func1: function(){}
  }).state({
    bar: 'bar',
    stateOverride: true,
    func2: function(){}
  }).create();

  equal(obj.foo.bar, 'bar',
    'Should set default state.');
  equal(obj.bar, 'bar',
    'Should set let you add by chaining .state().');
  ok(obj.stateOverride,
    'Should set let you override by chaining .state().');
  ok(obj.func1,
    'Should mix functions.');
  ok(obj.func2,
    'Should mix functions.');
});

test('stampit().state(a, b)', function () {
  var obj = stampit().state({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  ok(obj.a && obj.b,
    'Should mixIn objects when multiple methods are passed.');
});

module('Basics Enclose');

test('stampit({}, {}, enclose)', function () {
  var obj = stampit({}, {}, function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).create();
  
  equal(obj.getSecret(), 'foo',
    'Should set closure.');
});

test('stampit().enclose()', function () {
  var obj = stampit().enclose(function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).enclose(function () {
    this.a = 'a';
  }).enclose({
    bar: function bar() { this.b = 'b'; }
  }, {
    baz: function baz() { this.c = 'c'; }
  }).create();
  
  equal(obj.getSecret(), 'foo',
    'Should set closure.');
  ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');
});

test('stampit().enclose(args)', function () {
  var obj = stampit().enclose(function (a, b) {
    var secretA = a;
    var secretB = b;
    this.getA = function () { return secretA; };
    this.getB = function () { return secretB; };
  }).create(null, null, 0);

  equal(obj.getA(), null,
    'Should pass variables to closures.');
  equal(obj.getB(), 0,
    'Should pass variables to closures.');
});

module('Basics isStamp');

test('stampit.isStamp() with stamps', function () {
  var emptyStamp = stampit();
  var stateOnlyStamp = stampit().state({ a: 'b' });
  var methodsOnlyStamp = stampit({
    method: function () {}
  });
  var closureOnlyStamp = stampit().enclose(function () {});

  ok(stampit.isStamp(emptyStamp), 'Empty stamp should be seen as stamp.');
  ok(stampit.isStamp(stateOnlyStamp), 'State only stamp should be seen as stamp.');
  ok(stampit.isStamp(methodsOnlyStamp), 'Methods only stamp should be seen as stamp.');
  ok(stampit.isStamp(closureOnlyStamp), 'Closure only stamp should be seen as stamp.');
});

test('stampit.isStamp() with non stamps', function () {
  var obj1;
  var obj2 = { state: {}, methods: {}, enclose: {}, fixed: {} };
  var obj3 = function () {
    this.enclose = this;
  };
  var obj4 = function () {
    this.fixed = function () { };
  };

  ok(!stampit.isStamp(obj1) && !stampit.isStamp(obj2) && !stampit.isStamp(obj3) && !stampit.isStamp(obj4),
    'Should not be seen as stamp.');
});

module('Compose');

test('stampit().compose()', function () {
  var closuresCalled = 0,
    a = stampit({
        method: function () { return false; }
      },
      { state: false },
      function () {
        closuresCalled++;
      }),
    b = stampit({
        method: function () { return true; }
      },
      { state: true },
      function () {
        closuresCalled++;
      }),
    d;

  d = a.compose(b).create();

  ok(d.method() && d.state, 'Last stamp must win.');
  equal(closuresCalled, 2, 'Each stamp closure must be called.');
});

test('stampit.compose()', function () {
  var a = stampit({
        methodA: function () { return true; }
      },
      { stateA: true },
      function () {
        var secret = 'a';
        this.getA = function () { return secret; };
      }),
    b = stampit({
        methodB: function () { return true; }
      },
      { stateB: true },
      function () {
        var secret = true;
        this.getB = function () { return secret; };
      }),
    c = stampit({
        methodC: function () { return true; }
      },
      { stateC: true },
      function () {
        var secret = true;
        this.getC = function () { return secret; };
      }), d;

  d = stampit.compose(a, b, c).create();

  ok(d.methodA && d.stateA && d.getA &&
    d.methodB && d.stateB && d.getB &&
    d.methodC && d.stateC && d.getC,
    'Should compose all factory prototypes');
});

module('Oldskool');

test('stampit.convertConstructor()', function () {
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
  }).enclose(function () { 
    this.baz = 'baz';
  });

  // Now you can compose those old constructors just like you could
  // with any other factory...
  var myThing = stampit.compose(oldskool, newskool);
  var myThing2 = stampit.compose(newskool, oldskool);

  var t = myThing();
  var u = myThing2();

  equal(t.thing, 'initialized',
    'Constructor should execute.');

  equal(t.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  equal(t.base, 'base',
    'Prototype property should be mixed in.');

  equal(t.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  equal(t.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  equal(t.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  equal(t.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  equal(t.baz, 'baz',
    'Should be able to add new methods with .compose()');

  equal(u.thing, 'initialized',
    'Constructor should execute.');

  equal(u.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  equal(u.base, 'base',
    'Prototype property should be mixed in.');

  equal(u.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  equal(u.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  equal(u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  equal(u.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  equal(u.baz, 'baz',
    'Should be able to add new methods with .compose()');

  equal(u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype chain function should be mixed in.');
});

module('State safety');

test('Stamp state deep cloned for object created', function () {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().state({ deep: deep, foo: 'foo' });
  var stamp2 = stampit(null, { deep: deep, foo: 'foo' });

  var o1 = stamp1();
  var o2 = stamp1();
  o1.foo = 'another value';
  notEqual(o1.foo, o2.foo);
  o1.deep.foo = 'another value';
  notEqual(o1.deep.foo, o2.deep.foo);

  o1 = stamp2();
  o2 = stamp2();
  o1.foo = 'another value';
  notEqual(o1.foo, o2.foo);
  o1.deep.foo = 'another value';
  notEqual(o1.deep.foo, o2.deep.foo);
});

test('stamp(state) deep merge into object created', function () {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().state({ deep: deep, foo: 'foo', bar: 'bar' });
  var stamp2 = stampit(null, { deep: deep, foo: 'foo', bar: 'bar' });

  var deep2 = { foo: 'override', baz: 'baz' };
  var o1 = stamp1({ deep: deep2, foo: 'override', baz: 'baz' });
  var o2 = stamp2({ deep: deep2, foo: 'override', baz: 'baz' });

  equal(o1.foo, 'override');
  equal(o1.bar, 'bar');
  equal(o1.baz, 'baz');
  equal(o2.foo, 'override');
  equal(o2.bar, 'bar');
  equal(o2.baz, 'baz');
  equal(o1.deep.foo, 'override');
  equal(o1.deep.bar, 'bar');
  equal(o1.deep.baz, 'baz');
  equal(o2.deep.foo, 'override');
  equal(o2.deep.bar, 'bar');
  equal(o2.deep.baz, 'baz');
});

test('stampit.state(state) deep merge into stamp', function () {
  var stamp = stampit()
    .state({ deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .state({ deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' });
  var o = stamp();

  equal(o.foo, 'override');
  equal(o.bar, 'bar');
  equal(o.baz, 'baz');
  equal(o.deep.foo, 'override');
  equal(o.deep.bar, 'bar');
  equal(o.deep.baz, 'baz');
});

test('stamp.compose() deep merge state', function () {
  var stamp = stampit(null, { deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .compose(stampit(null, { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' }));
  var o = stamp();

  equal(o.foo, 'override');
  equal(o.bar, 'bar');
  equal(o.baz, 'baz');
  equal(o.deep.foo, 'override');
  equal(o.deep.bar, 'bar');
  equal(o.deep.baz, 'baz');
});

module('Immutability');

test('Basic stamp immutability', function () {
  var methods = { f: function F1() {} };
  var state = { s: { deep: 1 } };
  var stamp1 = stampit(methods, state);

  methods.f = function F2() {};
  state = { s: { deep: 2 } };
  var stamp2 = stampit(methods, state);

  notEqual(stamp1.fixed.methods, stamp2.fixed.methods);
  notEqual(stamp1.fixed.methods.f, stamp2.fixed.methods.f);
  notEqual(stamp1.fixed.state, stamp2.fixed.state);
  notEqual(stamp1.fixed.state.s, stamp2.fixed.state.s);
  notEqual(stamp1.fixed.state.s.deep, stamp2.fixed.state.s.deep);
  notEqual(stamp1.fixed.enclose, stamp2.fixed.enclose);
});

test('Stamp immutability made of same source', function () {
  var methods = { f: function F1() {} };
  var state = { s: { deep: 1 } };
  var stamp1 = stampit(methods, state);
  var stamp2 = stampit(methods, state);

  notEqual(stamp1.fixed.methods, stamp2.fixed.methods);
  notEqual(stamp1.fixed.state, stamp2.fixed.state);
  notEqual(stamp1.fixed.state.s, stamp2.fixed.state.s);
  notEqual(stamp1.fixed.enclose, stamp2.fixed.enclose);
});

test('Basic object immutability', function () {
  var methods = { f: function F1() {} };
  var state = { s: { deep: 1 } };
  var o1 = stampit(methods, state)();

  methods.f = function F2() {};
  state = { s: { deep: 2 } };
  var o2 = stampit(methods, state)();

  notEqual(o1, o2);
  notEqual(o1.f, o2.f);
  notEqual(o1.s, o2.s);
  notEqual(o1.s.deep, o2.s.deep);
});

test('Stamp chaining functions immutability', function () {
  var stamp1 = stampit();
  var stamp2 = stamp1.methods({ f: function F1() {} });
  var stamp3 = stamp2.state( { s: { deep: 1 } });
  var stamp4 = stamp3.state(function () { });
  var stamp5 = stamp4.compose(stampit());

  notEqual(stamp1, stamp2);
  notEqual(stamp2, stamp3);
  notEqual(stamp3, stamp4);
  notEqual(stamp4, stamp5);
});
'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Basics

test('stampit()', function (t) {
  t.equal(typeof stampit(), 'function',
    'Should produce a function.');

  t.end();
});

test('.create()', function (t) {
  var stamp = stampit({
    foo: function () { return 'foo'; }
  });

  t.equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');

  t.end();
});

test('.create(properties)', function (t) {
  var obj = stampit({}, { foo: 'bar' });
  obj = obj.create({ foo: 'foo' });

  t.equal(obj.foo, 'foo',
    'should override defaults.');

  t.end();
});

// Basics Methods

test('stampit(methods)', function (t) {
  var obj = stampit({
    foo: function () { return 'foo'; }
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');

  t.end();
});

test('stampit().methods()', function (t) {
  var obj = stampit().methods({
    foo: function () { return 'foo'; },
    methodOverride: function () { return false; },
    prop1: 1
  }).methods({
    bar: function () { return 'bar'; },
    methodOverride: function () { return true; },
    prop2: 2
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  t.ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  t.ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  t.ok(!obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');
  t.ok(!obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');

  t.end();
});

test('stampit(methods).methods()', function (t) {
  var obj = stampit({
    foo: function () { return 'foo'; },
    methodOverride: function () { return false; },
    prop1: 1
  }).methods({
    bar: function () { return 'bar'; },
    methodOverride: function () { return true; },
    prop2: 2
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  t.ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  t.ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  t.ok(!obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');
  t.ok(!obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');

  t.end();
});

test('stampit().methods(a, b)', function (t) {
  var obj = stampit().methods({
    a: function () { return 'a'; }
  }, {
    b: function () { return 'b'; }
  }).create();

  t.ok(obj.a() === 'a' && obj.b() === 'b',
    'Should mixIn objects when multiple methods are passed.');

  t.end();
});

// Basics Props

test('stampit({}, {}, {}, props)', function (t) {
  var obj = stampit({}, {}, {}, { foo: { bar: 'bar' } }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');

  t.end();
});

test('stampit().props()', function (t) {
  var obj = stampit().props({
    foo: { bar: 'bar' },
    propsOverride: false,
    func1: function(){}
  }).props({
    bar: 'bar',
    propsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.ok(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit({}, {}, {}, props).props()', function (t) {
  var obj = stampit(null, null, null, {
    foo: { bar: 'bar' },
    propsOverride: false,
    func1: function(){}
  }).props({
    bar: 'bar',
    propsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.ok(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit().props(a, b)', function (t) {
  var obj = stampit().props({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.ok(obj.a && obj.b,
    'Should mixIn objects when multiple objects are passed.');

  t.end();
});

// Basics refs

test('stampit({}, refs)', function (t) {
  var obj = stampit({}, { foo: { bar: 'bar' } }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');

  t.end();
});

test('stampit().refs()', function (t) {
  var obj = stampit().refs({
    foo: { bar: 'bar' },
    refsOverride: false,
    func1: function(){}
  }).refs({
    bar: 'bar',
    refsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.ok(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit({}, refs).refs()', function (t) {
  var obj = stampit(null, {
    foo: { bar: 'bar' },
    refsOverride: false,
    func1: function(){}
  }).refs({
    bar: 'bar',
    refsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.ok(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit().refs(a, b)', function (t) {
  var obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.ok(obj.a && obj.b,
    'Should mixIn objects when multiple properties are passed.');

  t.end();
});

// Basics Enclose

test('stampit({}, {}, enclose)', function (t) {
  var obj = stampit({}, {}, function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');

  t.end();
});

test('stampit().enclose()', function (t) {
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

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');

  t.end();
});

test('stampit({}, {}, enclose).enclose()', function (t) {
  var obj = stampit(null, null, function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).enclose(function () {
    this.a = 'a';
  }).enclose({
    bar: function bar() { this.b = 'b'; }
  }, {
    baz: function baz() { this.c = 'c'; }
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');

  t.end();
});

// Closure arguments

test('stamp.create({}, args)', function (t) {
  var obj = stampit().enclose(function (a, b) {
    this.getA = function () { return a; };
    this.getB = function () { return b; };
  }).create(null, null, 0);

  t.equal(obj.getA(), null,
    'Should pass variables to closures.');
  t.equal(obj.getB(), 0,
    'Should pass variables to closures.');

  t.end();
});

test('stamp.create({}, undefined, arg2)', function (t) {
  var obj = stampit().enclose(function (absent, present) {
    this.getAbsent = function () { return absent; };
    this.getPresent = function () { return present; };
  }).create(null, undefined, 'I exist');

  t.equal(obj.getAbsent(), undefined,
    'Should pass undefined variables to closures.');
  t.equal(obj.getPresent(), 'I exist',
    'Should pass variables to closures event after an undefined one.');

  t.end();
});

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

test('stampit.isStamp() with legacy stamps', function (t) {
  var emptyStamp = stampit();
  delete emptyStamp.fixed.refs;
  var refsOnlyStamp = stampit().refs({ a: 'b' });
  delete refsOnlyStamp.fixed.refs;
  var methodsOnlyStamp = stampit({
    method: function () {}
  });
  delete methodsOnlyStamp.fixed.refs;
  var closureOnlyStamp = stampit().enclose(function () {});
  delete closureOnlyStamp.fixed.refs;

  t.ok(stampit.isStamp(emptyStamp), 'Empty legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(refsOnlyStamp), 'Refs only legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(methodsOnlyStamp), 'Methods only legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(closureOnlyStamp), 'Closure only legacy stamp should be seen as stamp.');

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

// Compose

test('stampit().compose()', function (t) {
  var closuresCalled = 0,
    a = stampit({
        method: function () { return false; }
      },
      { ref: false },
      function () {
        closuresCalled++;
      },
      { prop: false }
    ),
    b = stampit({
        method: function () { return true; }
      },
      { ref: true },
      function () {
        closuresCalled++;
      },
      { prop: true }),
    d;

  d = a.compose(b).create();

  t.ok(d.method() && d.ref && d.prop, 'Last stamp must win.');
  t.equal(closuresCalled, 2, 'Each stamp closure must be called.');

  t.end();
});

test('stampit.compose()', function (t) {
  var a = stampit({
        methodA: function () { return true; }
      },
      { refA: true },
      function () {
        var secret = 'a';
        this.getA = function () { return secret; };
      },
      { propA: "1" }),
    b = stampit({
        methodB: function () { return true; }
      },
      { refB: true },
      function () {
        var secret = true;
        this.getB = function () { return secret; };
      },
      { propB: "1" }),
    c = stampit({
        methodC: function () { return true; }
      },
      { refC: true },
      function () {
        var secret = true;
        this.getC = function () { return secret; };
      },
      { propC: "1" }), d;

  d = stampit.compose(a, b, c).create();

  t.ok(d.methodA && d.refA && d.getA && d.propA &&
    d.methodB && d.refB && d.getB && d.propB &&
    d.methodC && d.refC && d.getC && d.propC,
    'Should compose all factory prototypes');

  t.end();
});

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
  }).enclose(function () {
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

// Props safety

test('Stamp props deep cloned for object created', function (t) {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().props({ deep: deep, foo: 'foo' });
  var stamp2 = stampit(null, null, null, { deep: deep, foo: 'foo' });

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
  var stamp2 = stampit(null, null, null, { deep: deep, foo: 'foo', bar: 'bar' });

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
  var stamp = stampit(null, null, null, { deep: { foo: 'foo', bar: 'bar' }, foo: 'foo', bar: 'bar' })
    .compose(stampit(null, null, null, { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' }));
  var o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, 'bar');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, 'bar');
  t.equal(o.deep.baz, 'baz');

  t.end();
});

// Refs shallow mixing

test('Stamp refs shallow copied for object created', function (t) {
  var deep = { foo: 'foo', bar: 'bar' };
  var stamp1 = stampit().refs({ deep: deep, foo: 'foo' });
  var stamp2 = stampit(null, { deep: deep, foo: 'foo' });

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
  var stamp = stampit(null, { deep: { foo: '1', bar: '1' }, foo: '1', bar: '1' })
    .compose(stampit(null, { deep: { foo: 'override', baz: 'baz' }, foo: 'override', baz: 'baz' }));
  var o = stamp();

  t.equal(o.foo, 'override');
  t.equal(o.bar, '1');
  t.equal(o.baz, 'baz');
  t.equal(o.deep.foo, 'override');
  t.equal(o.deep.bar, undefined);
  t.equal(o.deep.baz, 'baz');

  t.end();
});

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
  t.notEqual(stamp1.fixed.enclose, stamp2.fixed.enclose);

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
  t.notEqual(stamp1.fixed.enclose, stamp2.fixed.enclose);

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
  var stamp4 = stamp3.enclose(function () { });
  var stamp5 = stamp2.props( { p: { deep: 1 } });
  var stamp6 = stamp4.compose(stampit());

  t.notEqual(stamp1, stamp2);
  t.notEqual(stamp2, stamp3);
  t.notEqual(stamp3, stamp4);
  t.notEqual(stamp4, stamp5);
  t.notEqual(stamp5, stamp6);

  t.end();
});

// .state alias

test('stampit().fixed.state is same as refs', function (t) {
  var stamp = stampit(null, { s: 1 });

  t.equal(stamp.fixed.refs, stamp.fixed.state);

  t.end();
});

test('stampit().state().fixed.state is same as refs().fixed.refs', function (t) {
  var stamp = stampit(null, { s: 1 }).state({ s2: 2 });

  t.equal(stamp.fixed.refs, stamp.fixed.state);
  t.equal(stamp.fixed.refs.s, stamp.fixed.state.s);
  t.equal(stamp.fixed.refs.s2, stamp.fixed.state.s2);

  t.end();
});

test('stampit.compose().fixed.state is same as refs', function (t) {
  var stamp = stampit(null, { s: 1 }).compose(stampit(null, { s2: 2 }));

  t.equal(stamp.fixed.refs, stamp.fixed.state);

  t.end();
});

test('stampit.convertConstructor().fixed.state is same as refs', function (t) {
  function F(){}
  var stamp = stampit.convertConstructor(F);

  t.equal(stamp.fixed.refs, stamp.fixed.state);

  t.end();
});

// Stampit v1 compatibility

var stamp = {
  fixed: {
    methods: {},
    state: { s: 1 },
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

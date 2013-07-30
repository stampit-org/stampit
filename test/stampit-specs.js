'use strict';
/*global test, equal, ok, stampit*/
test('stampit()', function () {
  equal(typeof stampit(), 'function',
    'Should produce a function.');
});

test('.create()', function () {
  var stamp = stampit({
    foo: function () {
      return 'foo';
    }
  });

  equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');
});

test('.create(properties)', function () {
  var obj = stampit({}, {foo: 'bar'}).create({foo: 'foo'});
  equal(obj.foo, 'foo',
    'should override defaults.');
});

test('stampit(methods)', function () {
  var obj = stampit({
    foo: function () {
      return 'foo';
    }
  }).create();
  ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
});

test('stampit().methods()', function () {
  var obj = stampit().methods({
    foo: function () {
      return 'foo';
    },
    methodOverride: function () {
      return false;
    }
  }).methods({
    bar: function () {
      return 'bar';
    },
    methodOverride: function () {
      return true;
    }
  }).create();
  ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  ok(obj.bar(),
    'Should let you chain .methods() to add more.');
  ok(obj.methodOverride(),
    'Should let you override by chaining .methods().');
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

test('stampit({}, state)', function () {
  var obj = stampit({}, {
    foo: {bar: 'bar'}
  }).create();
  equal(obj.foo.bar, 'bar',
    'Should set default state.');
});

test('stampit().state()', function () {
  var obj = stampit().state({
    foo: {bar: 'bar'},
    stateOverride: false
  }).state({
    bar: 'bar',
    stateOverride: true
  }).create();
  equal(obj.foo.bar, 'bar',
    'Should set default state.');
  equal(obj.bar, 'bar',
    'Should set let you add by chaining .state().');
  ok(obj.stateOverride,
    'Should set let you override by chaining .state().');
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

test('stampit({}, {}, enclose)', function () {
  var obj = stampit({}, {}, function () {
    var secret = 'foo';

    this.getSecret = function () {
      return secret;
    };
  }).create();
  equal(obj.getSecret(), 'foo',
    'Should set closure.');
});

test('stampit().enclose()', function () {
  var obj = stampit().enclose(function () {
    var secret = 'foo';

    this.getSecret = function () {
      return secret;
    };
  }).enclose(function () {
    this.a = 'a';
  }).enclose({
    bar: function bar() {
      this.b = 'b';
    }
  }, {
    baz: function baz() {
      this.c = 'c';
    }
  }).create();
  equal(obj.getSecret(), 'foo',
    'Should set closure.');

  ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');
});

test('stampit.compose()', function () {
  var a = stampit({
        methodA: function () {
          return true;
        }
      },
      { stateA: true },
      function () {
        var secret = 'a';
        this.getA = function () {
          return secret;
        };
      }),
    b = stampit({
        methodB: function () {
          return true;
        }
      },
      { stateB: true },
      function () {
        var secret = true;
        this.getB = function () {
          return secret;
        };
      }),
    c = stampit({
        methodC: function () {
          return true;
        }
      },
      { stateC: true },
      function () {
        var secret = true;
        this.getC = function () {
          return secret;
        };
      }), d;
  
  d = stampit.compose(a, b, c).create();

  ok(d.methodA && d.stateA && d.getA &&
    d.methodB && d.stateB && d.getB &&
    d.methodC && d.stateC && d.getC,
    'Should compose all factory prototypes');
});

test('stampit.convertConstructor()', function () {
  // The old constructor / class thing...
  var Constructor = function Constructor() {
    this.thing = 'initialized';
  };
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

  var t = myThing();

  equal(t.thing, 'initialized',
    'Constructor should execute.');

  equal(t.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  equal(t.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  equal(t.baz, 'baz',
    'Should be able to add new methods with .compose()');

});


test('stampit.compose() with inheritance', function () {
  var c, i, m, n1, N2, sm, sn;
  var stateProto = {stateProto: true};
  var state = Object.create(stateProto);

  // create an object with a prototype
  N2 = function() {};
  N2.prototype = {n2: true};

  n1 = new N2();
  n1.n1 = true;

  // create a mixin that will get merged
  m = {m: true};

  state.state = true;

  // create and compose stampit objects
  sn = stampit(n1);
  sm = stampit(m);
  c = stampit.compose(sn, sm).state(state);

  // create instance
  i = c();

  ok(i.n1 && i.n2 && i.m, 'Should flatten nested prototypes.');

  equal(i.stateProto, undefined,
    'Should not flatten state prototypes.');
});
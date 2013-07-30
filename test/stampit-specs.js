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
      return 'bar'
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
  }).create();
  equal(obj.getSecret(), 'foo',
    'Should set closure.');
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
      }),
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
  var oldskool = stampit().methods(Constructor.prototype)
    .enclose(Constructor);

  // Now you can compose with it just like any other stampit factory...
  var myThing = stampit.compose(oldskool).methods({
    bar: function bar() { return 'bar'; }
   // your methods here...
  });

  var t = myThing();

  equal(t.thing, 'initialized',
    'Constructor should execute.');

  equal(t.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  equal(t.bar(), 'bar',
    'Should be able to add new methods with .compose()');
});
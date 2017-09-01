# Examples from *Programming JavaScript Applications* by Eric Elliott

Stampit was written as an example for the book, ["Programming JavaScript Applications" (O'Reilly)](http://pjabook.com). Stampit is first introduced in the last section of Chapter 3, *Prototypal Inheritance with Stamps*. 

The book's sample code uses Stampit 1.X. To load the examples in your browser, you need to include the Stampit 1.X script in your HTML page (you also require the [QUnit](https://qunitjs.com/) script and CSS):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Programming JavaScript Applications</title>
  <link rel="stylesheet" href="//code.jquery.com/qunit/qunit-1.18.0.css">
</head>
<body>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>
  <script src="//code.jquery.com/qunit/qunit-1.18.0.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/stampit/1.2.0/stampit.min.js"></script>
  <script src="example.js"></script>
</body>
</html>
```

Type or copy the example into `example.js`, and load the HTML in your browser for QUnit to display the test results.

## Stampit 2.X

In order to run the book's examples with Stampit 2.X, you must

1. Change the Stampit script source from `src="//cdnjs.cloudflare.com/ajax/libs/stampit/1.2.0/stampit.min.js"` to `src="//cdnjs.cloudflare.com/ajax/libs/stampit/2.1.0/stampit.min.js"`.
2. Modify the sample code to reflect the [breaking changes](https://github.com/stampit-org/stampit/releases/tag/2.0) between Stampit 1.X and 2.X. These modifications are shown below.

## Chapter 3 Examples

`stampit()` now receives options object `({methods,refs,init,props,static})` instead of multiple arguments. Additionally, `state` deprecated in favor of `refs` and `enclose` is deprecated in favor of `init`. Taking these changes into account, the first `stampit()` example from the book is now:

```js
var testObj = stampit({
  // methods in v1
  methods: {
    delegateMethod: function delegateMethod() {
      return 'shared property';
    }
  },

  // state in v1
  refs: {
    instanceProp: 'instance property'
  },

  // enclose in v1
  init: function () {
    var privateProp = 'private property';

    this.getPrivate = function getPrivate() {
      return privateProp;
    }
  }
}).create();

test('Stampit options object', function () {
  equal(testObj.delegateMethod(), 'shared property',
    'delegate methods should be reachable');

  ok(Object.getPrototypeOf(testObj).delegateMethod,
    'delegate methods should be stored on the ' +
    'delegate prototype');

  equal(testObj.instanceProp, 'instance property',
    'state should be reachable.');

  ok(testObj.hasOwnProperty('instanceProp'),
    'state should be instance safe.');

  equal(testObj.hasOwnProperty('privateProp'), false,
    'should hide private properties');

  equal(testObj.getPrivate(), 'private property',
    'should support privileged methods');
});
```

Changes to the subsequent examples in Chapter 3 follow. The next example, which demonstrates method chaining, becomes

```js
var testObj = stampit().methods({
    delegateMethod: function delegateMethod() {
      return 'shared property';
    }
  })
  .refs({
    instanceProp: 'instance property'
  })
  .init(function () {
    var privateProp = 'private property';

    this.getPrivate = function getPrivate() {
      return privateProp;
    }
  }).create();

test('Stampit 2 methods', function () {
  equal(testObj.delegateMethod(), 'shared property',
    'delegate methods should be reachable');

  equal(testObj.instanceProp, 'instance property',
    'state should be reachable.');

  equal(testObj.getPrivate(), 'private property',
    'should support privileged methods');
});
```

(with QUnit `test()` added). 

The next example demonstrates changing a prototype property at runtime. It uses only `stampit().methods()` and so is unchanged from the book:

```js
var stamp = stampit().methods({
    delegateMethod: function delegateMethod() {
      return 'shared property';
    }
  }),
  obj1 = stamp(),
  obj2 = stamp();

Object.getPrototypeOf(obj1).delegateMethod =
  function () {
    return 'altered';
  };

test('Prototype mutation', function () {
  equal(obj2.delegateMethod(), 'altered',
    'Instances share the delegate prototype.');
});
```

The `state()` concatenative inheritance example becomes `refs()`:

```js
var person = stampit().refs({name: ''}),
  jimi = person({name: 'Jimi Hendrix'});

test('Initialization', function () {

  equal(jimi.name, 'Jimi Hendrix',
    'Object should be initialized.');

});
```

The `enclose()` functional inheritance example becomes `init()`:

```js
var person = stampit().init(function () {
  var firstName = '',
    lastName = '';

  this.getName = function getName() {
    return firstName + ' ' + lastName;
  };

  this.setName = function setName(options) {
    firstName = options.firstName || '';
    lastName = options.lastName || '';
    return this;
  };
}),

jimi = person().setName({
  firstName: 'Jimi',
  lastName: 'Hendrix'
});

test('Init method', function () {

equal(jimi.getName(), 'Jimi Hendrix',
  'Object should be initialized.');

});
```
Finally (for Chapter 3), the `stampit.compose()` example becomes

```js
var a = stampit().init(function () {
  var a = 'a';

  this.getA = function () {
    return a;
  };
});

a().getA(); // 'a'

var b = stampit().init(function () {
  var a = 'b';

  this.getB = function () {
    return a;
  };
});

b().getB(); // 'b'

var c = stampit.compose(a, b),
  foo = c();

foo.getA(); // 'a'
foo.getB(); // 'b'

test ('Closures', function () {
  equal(a().getA(), 'a', "Private getA() gets a.");

  equal(b().getB(), 'b', "Private getB() gets b.");

  equal(a().getA(), 'a', "foo getA() gets a.");

  equal(b().getB(), 'b', "foo getB() gets b.");
});
```

(with QUnit `test()` added). Note that `enclose()` has been replaced with `init()`.

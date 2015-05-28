# Stampit
[![Travis-CI](https://travis-ci.org/ericelliott/stampit.svg?branch=v2_0)](https://travis-ci.org/ericelliott/stampit)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/ericelliott/stampit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Create objects from reusable, composable behaviors. Stampit uses [three different kinds of prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/) to let you inherit behavior in a way that is much more powerful and flexible than classical OO.

Looking for a deep dive into prototypal OO, stamps, and the Two Pillars of JavaScript? [Learn JavaScript with Eric Elliott](https://ericelliottjs.com).

## Status

**Stable,** in production use with millions of monthly users. There will be no breaking changes in the 1.x line.

Stampit was written as an example for the book, ["Programming JavaScript Applications" (O'Reilly)](http://pjabook.com).


## Contribute

Press the hack button to open this project in the Nitrous.IO online IDE.
[![Hack ericelliott/stampit on Nitrous.IO](https://d3o0mnbgv6k92a.cloudfront.net/assets/hack-l-v1-4b6757c3247e3c50314390ece34cdb11.png)](https://www.nitrous.io/hack_button?source=embed&runtime=nodejs&repo=ericelliott%2Fstampit&file_to_open=README.md)

## Install

Stampit can be [installed via npm](https://www.npmjs.com/package/stampit)

```shell
npm install stampit
```

or bower

```shell
bower install stampit
```

or [gem install](https://github.com/brettimus/stampitjs-rails)

```shell
gem install stampitjs-rails
```

or by [downloading the latest release](https://github.com/ericelliott/stampit/releases).

## Features

 * Create factory functions (called stamps) which stamp out new objects. All of the new objects inherit all of the prescribed behavior.

 * Compose stamps together to create new stamps.

 * Inherit methods and default state.

 * Supports composable private state and privileged methods.

 * References are copied across for each instance.
 
 * Properties are deeply merged and cloned for each instance, so it won't be accidentally shared.
 
 * Initializers are called for each new instance. Provide wide extesibility to stamp behavior.

 * For the curious - it's great for [learning about prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/). It mixes three major types of prototypes:
   1. differential inheritance, aka delegation (for methods),
   2. cloning, aka concatenation/exemplar prototypes (for state),
   3. functional / closure inheritance (for privacy / encapsulation)

## What's the Point?

Prototypal OO is great, and JavaScript's capabilities give us some really powerful tools to explore it, but it could be easier to use.

Basic questions like "how do I inherit privileged methods and private data?" and "what are some good alternatives to inheritance hierarchies?" are stumpers for many JavaScript users.

Let's answer both of these questions at the same time. First, we'll use a closure to create data privacy:

```js
var a = stampit().init(function () {
  var priv = 'a';
  this.getA = function () {
    return priv;
  };
});
```

It uses function scope to encapsulate private data. Note that the getter must be defined inside the function in order to access the closure variables.

Let's see if that worked:

```js
a(); // Object -- so far so good.
a().getA(); // "a"
```

Yes. Got it. In both of these instances, we actually created a brand new object, and then immediately threw it away, because we didn't assign it to anything. Don't worry about that.

Here's another:

```js
var b = stampit().init(function () {
  var priv = 'b';
  this.getB = function () {
    return a;
  };
});
```

Those `priv`'s are not a typo. The point is to demonstrate that `a` and `b`'s private variables won't clash.

But here's the real treat:

```js
var c = stampit.compose(a, b);

var foo = c(); // we won't throw this one away...

foo.getA(); // "a"
foo.getB(); // "b"
```

WAT? Yeah. You just inherited privileged methods and private data from two sources at the same time.

But that's boring. Let's see what else is on tap:

```js
// Some more privileged methods, with some private data.
// Use stampit.mixIn() to make this feel declarative:
var availability = stampit().init(function () {
  var isOpen = false; // private

  return stampit.mixIn(this, {
    open: function open() {
      isOpen = true;
      return this;
    },
    close: function close() {
      isOpen = false;
      return this;
    },
    isOpen: function isOpenMethod() {
      return isOpen;
    }
  });
});

// Here's a mixin with public methods, and some state:
var membership = stampit({
    add: function (member) {
      this.members[member.name] = member;
      return this;
    },
    getMember: function (name) {
      return this.members[name];
    }
  },
  {
    members: {}
  });

// Let's set some defaults:
var defaults = stampit().refs({
      name: 'The Saloon',
      specials: 'Whisky, Gin, Tequila'
    });

// Classical inheritance has nothing on this. No parent/child coupling. No deep inheritance hierarchies.
// Just good, clean code reusability.
var bar = stampit.compose(defaults, availability, membership);

// Note that you can override state on instantiation:
var myBar = bar({name: 'Moe\'s'});

// Silly, but proves that everything is as it should be.
myBar.add({name: 'Homer' }).open().getMember('Homer');
```

## More chaining

Chaining stamps *always* creates new stamps.

Chain `.methods()` ...

```js
var myStamp = stampit().methods({
  fooMethod: function () {
    return 'foo';
  },
  methodOverride: function () {
    return false;
  }
}).methods({
  barMethod: function () {
    return 'bar'
  },
  methodOverride: function () {
    return true;
  }
});
```

And `.refs()` ...

```js
myStamp = myStamp.refs({
  foo: {bar: 'bar'},
  stateOverride: false
}).refs({
  bar: 'bar',
  stateOverride: true
});
```

And `.props()` ...

```js
myStamp = myStamp.props({
  name: { first: 'John' }
}).props({
  name: { last: 'Doe' }
});
```

And `.init()` ...

```js
myStamp = myStamp.init(function () {
  var secret = 'foo';

  this.getSecret = function () {
    return secret;
  };
}).init(function () {
  this.a = true;
}).init({
  foo: function bar() {
    this.b = true;
  }
}, {
  bar: function baz() {
    this.c = true;
  }
});

var obj = myStamp.create();
obj.fooMethod && obj.barMethod && obj.methodOverride; // true
obj.foo && obj.bar && obj.stateOverride; // true
obj.name.first && obj.name.last; // true
obj.getSecret && obj.a && obj.b && obj.c; // true
```

And `.compose()`.

```js
var newStamp = baseStamp.compose(myStamp);
```

## Pass multiple objects into .methods(), .refs(), .init(), props(), or .compose().

Stampit mimics the behavior of `_.extend()`, `$.extend()` when you pass multiple objects into one of the prototype methods. 
In other words, it will copy all of the properties from those objects to the `.methods`, `.refs`, or `.init` prototype for the stamp. 
The properties from later arguments in the list will override the same named properties of previously passed in objects.

```js
  var obj = stampit().methods({
    a: function () { return 'a'; }
  }, {
    b: function () { return 'b'; }
  }).create();
```

Or `.refs()` ...

```js
  var obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();
```


Or `.init()` ...

```js
  var obj = stampit().init(function () {
    console.log(this);
  }, function () {
    console.log(this); // same as above
  }).create();
```

Or even `.compose()` ...

```js
  var obj = abstractStamp.compose(concreteStamp, additionalStamp, utilityStamp).create();
```

# Stampit API #

**Source: stampit.js**

### stampit() ###

Return a factory function (called a stamp) that will produce new objects using the
prototypes that are passed in or composed.

* `@param {Object} [methods]` A map of method names and bodies for delegation.
* `@param {Object} [refs]` A map of property names and values to copy for each new object.
* `@param {Function} [init]` A function (closure) used to extend stamps with advanced capabilities.
* `@return {Function} stamp` A factory to produce objects using the given prototypes.
* `@return {Function} stamp.create` Chaining sugar that invokes the stamp.
* `@return {Object} stamp.fixed` An object map containing the fixed prototypes.
* `@return {Function} stamp.methods` Add methods to the methods prototype. Chainable.
* `@return {Function} stamp.refs` Add properties to the properties. Chainable.
* `@return {Function} stamp.init` Add the closure prototype. Chainable.
* `@return {Function} stamp.compose` Add stamp to stamp. Chainable.


## The stamp object ##

### stamp.methods() ###

Take n objects and add them to the methods prototype. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.


### stamp.refs() ###

Take n objects and add them to the references. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

Has alias `stamp.state`. Deprecated.


### stamp.init([arg1] [,arg2] [,arg3...]) ###

Take n functions, an array of functions, or n objects and add
the functions to the initializers list. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

Has alias `stamp.enclose`. Deprecated.

Functions passed into `.init()` are called any time an
object is instantiated. That happens when the stamp function
is invoked, or when the `.create()` method is called.

Each function receives the following object as the first argument:
```
{
  instance,
  stamp,
  args
}
```

Examples (ES6).

Make any stamp cloneable.
```js
let Cloneable = stampit().init(({instance, stamp, args}) =>
  instance.clone = () => stamp(instance);
});

let MyStamp = stampit().refs({x: 42}).compose(Cloneable); // composing with the "Cloneable" behavior
MyStamp.create().clone().clone().clone().x === 42; // true
```

Teach any object to return original stamp:
```js
let SelfKnowlegeable = stampit().init(({instance, stamp, args}) =>
  this.originalStamp = stamp;
});

let MyStamp = stampit().refs({x: 42}).compose(SelfKnowlegeable); // composing with the "SelfKnowlegeable" behavior
MyStamp.create().originalStamp === MyStamp; // true
```

### stamp.compose([arg1] [,arg2] [,arg3...]) ###

Take one or more factories produced from stampit() and
combine them with `this` to produce and return a new factory object.
Combining overrides properties with last-in priority.
 * @return {Function} A new stampit factory composed from arguments.


### stamp.create([properties] [,arg2] [,arg3...]) ###

Just like calling `stamp()`, `stamp.create()` invokes the stamp
and returns a new object instance. The first argument is an object
containing properties you wish to set on the new objects.

The remaining arguments are passed to all `.init()`
functions. **WARNING** Avoid using two different `.init()`
functions that expect different arguments. `.init()`
functions that take arguments should not be considered safe to
compose with other `.init()` functions that also take
arguments. Taking arguments with an `.init()` function is an
anti-pattern that should be avoided, when possible.


## Utility methods ##

### stampit.compose() ###

Take two or more stamps produced from stampit() and
combine them to produce a new stamp. Combining overrides
properties with last-in priority.

* `@param {...Function|Function[]} stamp` any number of stamps.
* `@return {Function}` A new stamp composed from arguments.


### stampit.mixIn(destObj, source1 [, sourc2] [, source3]...) ###

Take a destination object followed by one or more source objects,
and copy the source object properties to the destination object,
with last in priority overrides.

* `@param {Object} destination` An object to copy properties to.
* `@param {...Object} source` An object to copy properties from.
* `@returns {Object}`


### stampit.extend() ###

Alias for `mixIn`.


### stampit.isStamp(obj) ###

Take an object and return true if it's a stamp, false otherwise.

* `@param {Object} destination` An object to copy properties to.
* `@returns {Boolean}`


### stampit.convertConstructor() ###

Take an old-fashioned JS constructor and return a stamp  that
you can freely compose with other stamps. It is possible to
use constructors that take arguments. Simply pass the arguments
into the returned stamp after the properties object:
`var myInstance = myStamp(props, arg1, arg2);`

Note that if you use this feature, it is **not safe** to compose
the resulting stamp with other stamps willy-nilly, because if two
different stamps depend on the argument passing feature, the arguments
will probably clash with each other, producing very unexpected results.

 * @param  {Function} Constructor 
 * @return {Function} A composable stampit factory (aka stamp).

```js
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
    }).init(function () {
      this.baz = 'baz';
    });

  // Now you can compose those old constructors just like you could
  // with any other stamp...
  var myThing = stampit.compose(oldskool, newskool);

  var t = myThing();

  t.thing; // 'initialized',

  t.foo(); // 'foo',

  t.bar(); // 'bar'
```

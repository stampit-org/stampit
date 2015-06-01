# Stampit
[![Travis-CI](https://travis-ci.org/ericelliott/stampit.svg)](https://travis-ci.org/ericelliott/stampit)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/ericelliott/stampit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Create objects from reusable, composable behaviors. Stampit uses [three different kinds of prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/) to let you inherit behavior in a way that is much more powerful and flexible than classical OO.

Stampit was written as an example for the book, ["Programming JavaScript Applications" (O'Reilly)](http://pjabook.com).

Looking for a deep dive into prototypal OO, stamps, and the Two Pillars of JavaScript? [Learn JavaScript with Eric Elliott](https://ericelliottjs.com).

## Status

**v1, stable,** in production use with millions of monthly users. There will be no breaking changes in the 1.x line.

**v2, current stable**. Breaking changes:
* `stampit()` now receives options object (`{methods,refs,init,props}`) instead of multiple arguments.
* All chaining methods return new stamps instead of self-mutating `this` stamp.
* `state()` always shallow merge properties. It was not doing so in a single rare case.
* Instead of factory arguments the `enclose()` functions now recieve the following object `{ instance, stamp, args }`.

There is a slight chance these changes affect your current codebase. If so, we would recommend you to update to v2 becuase it is more powerful. See [advances examples](https://github.com/ericelliott/stampit/blob/master/ADVANCED_EXAMPLES.md).


## Contribute

Press the hack button to open this project in the Nitrous.IO online IDE.
[![Hack ericelliott/stampit on Nitrous.IO](https://d3o0mnbgv6k92a.cloudfront.net/assets/hack-l-v1-4b6757c3247e3c50314390ece34cdb11.png)](https://www.nitrous.io/hack_button?source=embed&runtime=nodejs&repo=ericelliott%2Fstampit&file_to_open=README.md)

Pull requests are welcome anytime. 

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
 
 * Initializers are called for each new instance. Provides wide extensibility to stamp behavior.

 * For the curious - it's great for [learning about prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/). It mixes three major types of prototypes:
   1. differential inheritance, aka delegation (for methods),
   2. cloning, aka concatenation/exemplar prototypes (for state),
   3. functional / closure inheritance (for privacy / encapsulation)

## What is a Stamp?

A stamp is a composable factory function created by calling `stampit()`. When invoked the factory function creates and returns object instances assigning:
 ```js
 var myStamp = stampit().
   methods({ doSomething: function(){} }). // methods each new object instance will have
   refs({ myObj: myObjByRef }). // properties to be set by reference to object instances
   init(function(context){ }). // add an init function to be called when an object instance is created
   props({ foo: {bar: 'bam'} }); // properties to be cloned and assigned to object instances
 ```

All of these stampit methods may be called multiple times to add more elements to the factory.

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
    return priv;
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
// Use stampit.mixin() to make this feel declarative:
var availability = stampit().init(function () {
  var isOpen = false; // private

  return stampit.mixin(this, {
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
  methods: {
    add: function (member) {
      this.members[member.name] = member;
      return this;
    },
    getMember: function (name) {
      return this.members[name];
    }
  },
  refs: {
    members: {}
  }
});

// Let's set some defaults:
var defaults = stampit().refs({
      name: 'The Saloon',
      specials: 'Whisky, Gin, Tequila'
    });

// Classical inheritance has nothing on this. No parent/child coupling. No deep inheritance hierarchies.
// Just good, clean code reusability.
var bar = stampit.compose(defaults, availability, membership);

// Note that you can override references on instantiation:
var myBar = bar({name: 'Moe\'s'});

// Silly, but proves that everything is as it should be.
myBar.add({name: 'Homer' }).open().getMember('Homer');
```

## Statics

Stamps have a `static` method. This method applies passed object properties to the calling stamp's object. `static` is a convenience method. The old school way to apply statics to a stamp is by using stampit's `mixIn/extend` method.

```js
stampit.extend(stamp, {
  foo: 'foo'
});

This can now be written as:

stamp.static({
  foo: 'foo'
});
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

And `.static()` ...

```js
myStamp.static({
  foo: {bar: 'bar'},
  staticOverride: false
}).static({
  bar: 'bar',
  staticOverride: true
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

## Pass multiple objects into .methods(), .refs(), .init(), props(), .static(), or .compose().

Stampit mimics the behavior of `_.extend()`, `$.extend()` when you pass multiple objects into one of the stamp methods. 
In other words, it will copy all of the properties from those objects to the `.methods`, `.refs`, `.init` or `.props` of the stamp. 
The properties from later arguments in the list will override the same named properties of previously passed in objects. `refs` will be copied by reference. `props` will be deeply merged.

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


Or `.props()` ...

```js
  var obj = stampit().props({
    name: { first: 'John' }
  }, {
    name: { last: 'Doe' }
  }).create();
```

Or `.static()` ...

```js
  var obj = stampit().static({
    foo: 'foo'
  }, {
    bar: 'bar'
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
components that are passed in or composed.

 * @param  {Object} [options] Options to build stamp from: `{ methods, refs, init, props }`
 * @param  {Object} [options.methods] A map of method names and bodies for delegation.
 * @param  {Object} [options.refs] A map of property names and values to be mixed into each new object.
 * @param  {Object} [options.init] A closure (function) used to create private data and privileged methods.
 * @param  {Object} [options.props] An object to be deeply cloned into each newly stamped object.
 * @return {Function} factory A factory to produce objects.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the stamp metadata.
 * @return {Function} factory.methods Add methods to the stamp. Chainable.
 * @return {Function} factory.refs Add references to the stamp. Chainable.
 * @return {Function} factory.init Add a closure which called on object instantiation. Chainable.
 * @return {Function} factory.props Add deeply cloned properties to the produced objects. Chainable.
 * @return {Function} factory.compose Add stamp to stamp. Chainable.
 * @return {Function} factory.static Add properties to the factory object. Chainable.


## The stamp object ##

### stamp.methods() ###

Take n objects and add them to the methods list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.


### stamp.refs() ###

Take n objects and add them to the references list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

It has an alias - `stamp.state()`. Deprecated.


### stamp.init([arg1] [,arg2] [,arg3...]) ###

Take n functions, an array of functions, or n objects and add
the functions to the initializers list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

It has an alias - `stamp.enclose()`. Deprecated.

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

### stamp.props() ###

Take n objects and deep merge them to the properties. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.


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


### stamp.static() ###

Take n objects and add all props to the factory object.
* @return {Object} stamp The factory in question (`this`).


## Utility methods ##

### stampit.methods() ###

Shortcut for `stampit().methods()`

### stampit.refs() ###

Shortcut for `stampit().refs()` 

### stampit.init() ###

Shortcut for `stampit().init()`

### stampit.props() ###

Shortcut for `stampit().props()`

### stampit.compose() ###

Take two or more stamps produced from stampit() and
combine them to produce a new stamp. Combining overrides
properties with last-in priority.

* `@param {...Function|Function[]} stamp` any number of stamps.
* `@return {Function}` A new stamp composed from arguments.


### stampit.mixin(destObj, source1 [, sourc2] [, source3]...) ###

Same as `Object.assign()`.
Take a destination object followed by one or more source objects,
and copy the source object properties to the destination object,
with last in priority overrides.

* `@param {Object} destination` An object to copy properties to.
* `@param {...Object} source` An object to copy properties from.
* `@returns {Object}`


### stampit.extend(), .mixIn(), .assign() ###

Aliases for `stampit.mixin()`.


### stampit.isStamp(obj) ###

Take an object and return `true` if it's a stamp, `false` otherwise.


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
  var newskool = stampit({
    methods: {
      bar: function bar() { return 'bar'; }
     // your methods here...
    },
    init: function () {
      this.baz = 'baz';
    }
  });

  // Now you can compose those old constructors just like you could
  // with any other stamp...
  var myThing = stampit.compose(oldskool, newskool);

  var t = myThing();

  t.thing; // 'initialized',

  t.foo(); // 'foo',

  t.bar(); // 'bar'
```

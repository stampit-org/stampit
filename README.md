<img src="https://raw.githubusercontent.com/stampit-org/stampit-logo/master/stampit-logo.png" alt="stampit" width="320" />
-----
[![Travis-CI](https://travis-ci.org/stampit-org/stampit.svg)](https://travis-ci.org/stampit-org/stampit)[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/stampit-org/stampit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Create objects from reusable, composable behaviors. Stampit uses [three different kinds of prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/) to let you inherit behavior in a way that is much more powerful and flexible than classical OO.

Stampit was written as an example for the book, ["Programming JavaScript Applications" (O'Reilly)](http://pjabook.com).

Looking for a deep dive into prototypal OO, stamps, and the Two Pillars of JavaScript? [Learn JavaScript with Eric Elliott](https://ericelliottjs.com).

**React Users.** Stampit *loves* React. Check out [react-stampit](https://github.com/stampit-org/react-stampit) for composable components.


## Status

* **v1, stable,** in production use with millions of monthly users. There will be no breaking changes in the 1.x line.
* **v2, current stable**. See breaking changes and new features on the 
[releases page](https://github.com/stampit-org/stampit/releases/tag/2.0).


## Install

Stampit can be [installed via npm](https://www.npmjs.com/package/stampit)

```shell
npm install stampit
```

or [Bower](https://github.com/stampit-org/stampit-bower) (UMD)
```shell
bower install stampit
```

or the *unofficial* [gem](https://github.com/brettimus/stampitjs-rails)

```shell
gem install stampitjs-rails
```

or referenced via [CDNJS](https://cdnjs.com/libraries/stampit)

or by [downloading the latest release](https://github.com/stampit-org/stampit/releases).

## Examples

See [API](docs/API.md).


## Features

 * Create factory functions (called stamps) which stamp out new objects. All of the new objects inherit all of the prescribed behavior.

 * Assign properties by passing a references object to the stamp (factory function).

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

A stamp is a composable factory function. Stamps allow you to inherit easily from multiple ancestors by composing multiple source stamps. 
You can combine properties, methods, and initializers (with closures) from any number of stamps to produce a new stamp. 
Stamps are more flexible than traditional factory functions or classical multiple inheritance. 
Traditional factory functions can't be composed together to produce new factory functions. 
Class inheritance does not provide a standardized mechanism for class composition.

Stamp composition takes advantage of three different kinds of prototypal inheritance:

* Differential inheritance, aka delegation (e.g., JavaScript's [[Prototype]]),
* Mixins/cloning with optional deep merge, aka concatenative inheritance (e.g., JavaScript's `Object.assign()`),
* Functional / closure inheritance (for initialization or privacy/encapsulation)

When invoked the stamp factory function creates and returns object instances assigning:
```js
const DbAuthStamp = stampit().
  methods({ authorize: function(){} }). // methods each new object instance will have
  refs({user: {name: 'guest', pwd: ''}}). // properties to be set by reference to object instances
  init(function(context){ }). // init function(s) to be called when an object instance is created
  props({db: {host: 'localhost'}}); // properties to be deeply merged to object instances

const dbAuthorizer = DbAuthStamp({ user: adminUserCredentials });
```

### How are Stamps Different from Classes?

* It's easy to combine multiple stamps to create a new stamp with all of the source stamp capabilities
* Stamps are factory functions, so they don't need to be invoked with `new` (which couples callers to the implementation of object instantiation)
* Stamps don't create parent-child class hierarchies. Class hierarchies create "is-a" relationships between classes. Stamp composition creates "has-a" or "uses-a" relationships, instead. For that reason, stamp inheritance is less brittle than class inheritance.


## What's the Point?

Prototypal OO is great, and JavaScript's capabilities give us some really powerful tools to explore it, but it could be easier to use.

Basic questions like "how do I inherit privileged methods and private data?" and 
"what are some good alternatives to inheritance hierarchies?" are stumpers for many JavaScript users.

Let's answer both of these questions at the same time. First, we'll use a closure to create data privacy:

```js
const a = stampit().init(function () {
  const priv = 'a';
  this.getA = () => {
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

Yes. Got it. In both of these instances, we actually created a brand new object, and then immediately threw it away, 
because we didn't assign it to anything. Don't worry about that.

Here's another:

```js
const b = stampit().init(function () {
  const priv = 'b';
  this.getB = () => {
    return priv;
  };
});
```

Those `priv`'s are not a typo. The point is to demonstrate that `a` and `b`'s private variables won't clash.

But here's the real treat:

```js
const c = stampit.compose(a, b);

const foo = c(); // we won't throw this one away...

foo.getA(); // "a"
foo.getB(); // "b"
```

WAT? Yeah. You just inherited privileged methods and private data from two sources at the same time.

But that's boring. Let's see what else is on tap:

```js
// Some more privileged methods, with some private data.
const availability = stampit().init(() => {
  var isOpen = false; // private

  instance.open = function open() {
    isOpen = true;
    return this;
  };
  instance.close = function close() {
    isOpen = false;
    return this;
  };
  instance.isOpen = function isOpenMethod() {
    return isOpen;
  }
});

// Here's a stamp with public methods, and some state:
const membership = stampit({
  methods: {
    add(member) {
      this.members[member.name] = member;
      return this;
    },
    getMember(name) {
      return this.members[name];
    }
  },
  refs: {
    members: {}
  }
});

// Let's set some defaults:
const defaults = stampit().refs({
  name: 'The Saloon',
  specials: 'Whisky, Gin, Tequila'
});

// Classical inheritance has nothing on this. No parent/child coupling. No deep inheritance hierarchies.
// Just good, clean code reusability.
const bar = stampit.compose(defaults, availability, membership);

// Note that you can override references on instantiation:
const myBar = bar({name: 'Moe\'s'});

// Silly, but proves that everything is as it should be.
myBar.add({name: 'Homer'}).open().getMember('Homer');
```

For more examples see the [API](docs/API.md) and the [advanced examples](docs/advanced_examples.md).

# Stampit

Create objects from reusable, composable behaviors.

## Features

 * Create functions (called factories) which stamp out new objects. All of the new objects inherit all of the prescribed behavior.

 * Compose factories together to create new factories.

 * Inherit methods and default state.

 * Supports composable private state and privileged methods.

 * State is cloned for each instance, so it won't be accidentally shared.

 * For the curious - it's great for [learning about prototypal OO](http://ericleads.com/2013/02/fluent-javascript-three-different-kinds-of-prototypal-oo/). It mixes three major types of prototypes:
   1. differential inheritance, aka delegation (for methods),
   2. cloning, aka concatenation/exemplar prototypes (for state),
   3. functional / closure prototypes (for privacy / encapsulation)

## What's the Point?

Prototypal OO is great, and JavaScript's capabilities give us some really powerful tools to explore it, but it could be easier to use.

Basic questions like "how do I inherit privileged methods and private data?" and "what are some good alternatives to inheritance hierarchies?" are stumpers for many JavaScript users.

Let's answer both of these questions at the same time. First, we'll use a closure to create data privacy:

```
var a = stampit().enclose(function () {
  var a = 'a';
  this.getA = function () {
    return a;
  };
});
```

It uses function scope to encapsulate private data. Note that the getter must be defined inside the function in order to access the closure variables.

Let's see if that worked:

```
a(); // Object -- so far so good.
a().getA(); // "a"
```

Yes. Got it. In both of these instances, we actually created a brand new object, and then immediately threw it away, because we didn't assign it to anything. Don't worry about that.

Here's another:

```
var b = stampit().enclose(function () {
  var a = 'b';
  this.getB = function () {
    return a;
  };
});
```

Those `a`'s are not a typo. The point is to demonstrate that `a` and `b`'s private variables won't clash.

But here's the real treat:

```
var c = stampit.compose(a, b);

var foo = c(); // we won't throw this one away...

foo.getA(); // "a"
foo.getB(); // "b"
```

WAT? Yeah. You just inherited privileged methods and private data from two sources at the same time.

But that's boring. Let's see what else is on tap:

```
// Some more privileged methods, with some private data.
// Use stampit.extend() to make this feel declarative:
var availability = stampit().enclose(function () {
  var isOpen = false; // private

  return stampit.extend(this, {
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
var defaults = stampit().state({
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

You can chain `.methods()` ...

```
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
```

And `.state()` ...

```
var obj = stampit().state({
  foo: {bar: 'bar'},
  stateOverride: false
}).state({
  bar: 'bar',
  stateOverride: true
}).create();
```

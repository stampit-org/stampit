# Stampit API

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Example](#example)
- [stampit(...args)](#stampitargs)
- [The stamp object](#the-stamp-object)
  - [stamp.methods(...args)](#stampmethodsargs)
  - [stamp.props(...args) and stamp.properties(...args)](#stamppropsargs-and-stamppropertiesargs)
  - [stamp.init(...args) and stamp.initializers(...args)](#stampinitargs-and-stampinitializersargs)
    - [Examples](#examples)
  - [stamp.composers(...args)](#stampcomposersargs)
    - [Examples](#examples-1)
  - [stamp.deepProps(...args) and stamp.deepProperties(...args)](#stampdeeppropsargs-and-stampdeeppropertiesargs)
  - [stamp.statics(...args) and stamp.staticProperties(...args)](#stampstaticsargs-and-stampstaticpropertiesargs)
  - [stamp.deepStatics(...args) and stamp.deepStaticProperties(...args)](#stampdeepstaticsargs-and-stampdeepstaticpropertiesargs)
  - [stamp.conf(...args) and stamp.configuration(...args)](#stampconfargs-and-stampconfigurationargs)
    - [Examples](#examples-2)
  - [stamp.deepConf(...args) and stamp.deepConfiguration(...args)](#stampdeepconfargs-and-stampdeepconfigurationargs)
  - [stamp.propertyDescriptors(...args)](#stamppropertydescriptorsargs)
  - [stamp.staticPropertyDescriptors(...args)](#stampstaticpropertydescriptorsargs)
  - [stamp.compose(...args)](#stampcomposeargs)
  - [stamp.create(...args)](#stampcreateargs)
- [Shortcut methods](#shortcut-methods)
- [Utility functions](#utility-functions)
  - [stampit/compose](#stampitcompose)
  - [stampit/isStamp](#stampitisstamp)
  - [stampit/isComposable](#stampitiscomposable)
- [Chaining methods](#chaining-methods)
  - [Pass multiple objects into all methods and functions](#pass-multiple-objects-into-all-methods-and-functions)
- [Breaking changes](#breaking-changes)
  - [Stampit v2](#stampit-v2)
  - [Stampit v3](#stampit-v3)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Example

```js
// Adds .log() method to factory instantiated objects.
const Logger = stampit()
  .methods({
    log: console.log
  });

// Assigns the default connection string.
const DefaultConnectionConfig = stampit()
  .init(function ({connectionConfig}) { // can pass the string as factory argument
    this.connectionConfig = connectionConfig;
  })
  .props({ // if nothing was passed this value will be used
    connectionConfig: require('./config.json').db.connection
  });
  
// Allow dbConnection to be passed from outside.
const AcceptsDbConnection = stampit()
  .init(function ({dbConnection}) {
    this.dbConnection = dbConnection;
  });

// The connection object.
const DbConnection = stampit()
  .props({ // Assigns the mongoose connection object.
    dbConnection: mongoose.connection
  })
  .compose(
    Logger, // add logging capability via this.log() 
    DefaultConnectionConfig, // add the default this.connectionConfig value
    AcceptsDbConnection // allow passing dbConnection as argument
  )
  .init(function () { // Connecting to the DB upon creating an object.
    if (!this.dbConnection.readyState) {
      this.dbConnection.open(this.connectionConfig);
      this.log('Opening a DB connection');
    }
  })
  .methods({ // A method to close the connection.
    close() {
      if (this.dbConnection.readyState) {
        this.dbConnection.close();
        this.log('Closing the DB connection');
      }
    }
  });

const conn = DbConnection(); // Open a default DB connection
const conn2 = DbConnection({ dbConnection: conn.dbConnection }); // reusing existing
conn.close(); // Close the conneciton.

// Connect to a different DB.
const localConn = DbConnection({ connectionConfig: 'mongodb://localhost' });
```


## stampit(...args)

The arguments can be either another stamps, or the following structure:

 * `@param  {Object} [options]` Options to build stamp from
 * `@param  {Object} [options.methods]` A map of method names and bodies for delegation
 * `@param  {Object} [options.props]` A map of property names and values to be mixed into each new object
 * `@param  {Object} [options.refs]` Same as `options.props`. *DEPRECATED*
 * `@param  {Object} [options.properties]` Same as `options.props`
 * `@param  {Object} [options.init]` A closure (function) used to create private data and privileged methods
 * `@param  {Object} [options.initializers]` Same as `options.init`
 * `@param  {Object} [options.composers]` (EXPERIMENTAL) Similar to initializers, but executed at the composition time
 * `@param  {Object} [options.deepProps]` An object to be deeply cloned into each newly stamped object
 * `@param  {Object} [options.deepProperties]` Same as `options.deepProps`
 * `@param  {Object} [options.statics]` A map of property names and values to be mixed onto stamp itself
 * `@param  {Object} [options.staticProperties]` Same as `options.statics`
 * `@param  {Object} [options.deepStatics]` An object to be deeply cloned onto stamp itself
 * `@param  {Object} [options.staticDeepProperties]` Same as `options.statics`
 * `@param  {Object} [options.conf]` Arbitrary data assigned to the stamp metadata. Not used by stampit
 * `@param  {Object} [options.configuration]` Same as `options.conf`
 * `@param  {Object} [options.deepConf]` Deeply merged arbitrary data assigned to the stamp metadata. Not used by stampit
 * `@param  {Object} [options.deepConfiguration]` Same as `options.conf`
 * `@param  {Object} [options.propertyDescriptors]` Property descriptors applied to objects. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
 * `@param  {Object} [options.staticPropertyDescriptors]` Property descriptors applied to stamps. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

Returns a new factory function (called a stamp) that will produce new objects.

 * `@return {Function} stamp` A factory function to produce objects
 * `@return {Function} stamp.create` Just like calling the factory function itself
 * `@return {Function} stamp.compose` An object map containing the stamp metadata, also composes arguments and creates new stamps based on the current
 * `@return {Function} stamp.methods` Add methods to the stamp. Returns a new stamp
 * `@return {Function} stamp.props` Add properties by assignment to the stamp. Returns a new stamp
 * `@return {Function} stamp.refs` Same as `stamp.props`. *DEPRECATED*
 * `@return {Function} stamp.properties` Same as `stamp.props`
 * `@return {Function} stamp.init` Add an initializer which called on object instantiation. Returns a new stamp
 * `@return {Function} stamp.initializers` Add an initializer which called on object instantiation. Returns a new stamp
 * `@return {Function} stamp.composers` (EXPERIMENTAL) Add a composer function which is called on stamp composition. Returns a new stamp
 * `@return {Function} stamp.deepProps` Add deeply cloned properties to the produced objects. Returns a new stamp
 * `@return {Function} stamp.deepProperties` Same as `stamp.deepProps`
 * `@return {Function} stamp.statics` Add properties to the factory object. Returns a new stamp
 * `@return {Function} stamp.staticProperties` Same as `stamp.statics`
 * `@return {Function} stamp.deepStatics` Add deeply cloned properties to the factory object. Returns a new stamp
 * `@return {Function} stamp.staticDeepProperties` Same as `stamp.deepStatics`
 * `@return {Function} stamp.conf` Assign arbitrary data to the stamp metadata. Not used by stampit. Returns a new stamp
 * `@return {Function} stamp.configuration` Same as `stamp.conf`
 * `@return {Function} stamp.deepConf` Deeply merge and clone arbitrary data to the stamp metadata. Not used by stampit. Returns a new stamp
 * `@return {Function} stamp.deepConfiguration` Same as `stamp.deepConf`
 * `@return {Function} stamp.propertyDescriptors` Property descriptors applied to objects. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty). Returns a new stamp
 * `@return {Function} stamp.staticPropertyDescriptors` Property descriptors applied to stamps. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty). Returns a new stamp

```js
const stamp = stampit({
  methods: {
    amplify(value) {
      return this.factor * value;
    }
  },
  props: {
    defaultFactor: 1
  },
  init({factor}) {
    this.factor = factor >= 0 ? factor : this.defaultFactor;
  }
});

const objectInstance = stamp({factor: 1.1});
```

## The stamp object


### stamp.methods(...args)

Take n objects and add them to the methods list of a new stamp. Creates new stamp.
* `@return {Object} stamp` The new stamp based on the original `this` stamp.

```js
const stamp = stampit().methods({
  error: console.error,
  amplify(value) {
    if (!isFinite(value) || value < 0) { this.error(`value ${value} is incorrect`); }
    return this.factor * value;
  }
});

stamp().amplify('BADF00D'); // value BADF00D is incorrect
```

### stamp.props(...args) and stamp.properties(...args)

Take n objects and add them to the references list of a new stamp. Creates new stamp.
* `@return {Object} stamp` The new stamp based on the original `this` stamp.

```js
const stamp = stampit().props({
  factor: 1
});

console.log(stamp().factor); // 1
console.log(stamp.props({factor: 5})().factor); // 5
```

It's really important to know the difference between a reference and an actual value. [Primitive
types](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) can be used in `props`
without limititation. However the following might be source of confusion and bugs.

```js
const stamp = stampit().props({
  salaries: []
});

const firstInstance = stamp();
firstInstance.salaries.push(100);
console.log(firstInstance.salaries); // [100]

const secondInstance = stamp();
secondInstance.salaries.push(200);
console.log(firstInstance.salaries); // [100, 200]
console.log(secondInstance.salaries); // [100, 200]
```

What happened? The `salaries` property was kept as *reference* inside the stamp metadata. Every
instance made from that stamp would share the same reference. To solve this, you can either
create a new array for every instance or simply use `deepProps` instead which would make 
a copy of everything.

```js
const stamp = stampit().props({
  salaries: null
}).init((opts, {instance}) => {
  instance.salaries = [];
});

// just last line from previous example, now it works correctly
secondInstance.salaries.push(200); // [200]
```

### stamp.init(...args) and stamp.initializers(...args)

Take n functions or array(s) of functions and add
the functions to the initializers list of a new stamp. Creates new stamp.
* `@return {Object} stamp` The new stamp based on the original `this` stamp.

Functions passed into `.init()` are called any time an
object is instantiated. That happens when the stamp function
is invoked, or when the `.create()` method is called.

If an initializer returns a non-undefined value then it becomes the factory 
instantiated value.

Each function receives the first argument of the called factory function and second object argument is like this:
```
{
  instance, // The same as `this`. Handy when using with the ES6 fat arrows
  stamp,    // The factory being executed at the moment
  args      // The arguments passed to the factory
}
```

#### Examples

Private state.
```js
const stamp = stampit().init((opts, {instance}) => {
  const factor = opts.factor || 1;
  instance.getFactor = () => factor;
});

console.log(stamp().getFactor()); // 1
console.log(stamp({factor: 2.5}).getFactor()); // 2.5
```

Make any stamp cloneable.
```js
const Cloneable = stampit().init((opts, {instance, stamp, args}) => {
  instance.clone = () => stamp.apply(undefined, args);
});

const MyStamp = stampit().props({x: 42}).compose(Cloneable); // composing with the "Cloneable" behavior
MyStamp().clone().clone().clone().x === 42; // true
```


### stamp.composers(...args)
**(EXPERIMENTAL)**

Take n functions or array(s) of functions and add the functions to the `deepConfiguration.composers` list of a new stamp. Creates new stamp. 
* `@return {Object} stamp` The new stamp based on the original `this` stamp.

Functions passed into `.composers()` are executed on the spot and every other time the new stamp or its derivatives are being composed. They are sort of a after-composition callbacks.

If a composer function returns a stamp then it becomes the resulting stamp.

Each function receives an options object with two properties:
```
{
  composables, // The list of composables being merged
  stamp        // The resulting stamp
}
```

#### Examples

Collect every composable the stamp was created from.
```js
const ComponentsMonitoring = stampit().composers(({stamp, composables}) => {
  const conf = stamp.compose.configuration || {};
  conf._wasComposedOf = _.uniq(composables.concat(conf._wasComposedOf));
  stamp.compose.configuration = conf;
});

const stamp = stampit().compose(ComponentsMonitoring)
  .init(() => {})
  .methods({foo() {}})
  .props({a: 1});

console.log(stamp.compose.configuration._wasComposedOf);
```

**NOTE:** The example below can be implemented using plain old higher order functions.

Same time, make your stamps to produce functions instead of plain objects:
```js
const ProduceFunction = stampit({
  statics: {
    produceCloneOf(func) {
      function FirstInitializer() {
        function theClone() { return func.apply(this, arguments); };
        Object.assign(theClone, Object.getPrototypeOf(this), this);
        return theClone;
      }
      return this.conf({FirstInitializer});
    }  
  },
  composers({stamp}) {
    const conf = stamp.compose.configuration || {};
    if (conf.FirstInitializer) {
      let inits = stamp.compose.initializers || [];
      // Make my initializer the first.
      inits = _.uniq([conf.FirstInitializer].concat(inits));
      stamp.compose.initializers = inits;
    }
  }
});

const stamp = stampit().compose(ProduceFunction, ComponentsMonitoring)
  .produceCloneOf(function () {
    console.log('A clone of this function was returned as a stamp result');
  });

console.log(stamp.compose.configuration._wasComposedOf);
const producedFunction = stamp();
producedFunction(); // prints "A clone of this function was returned as a stamp result"
```


### stamp.deepProps(...args) and stamp.deepProperties(...args)

Take n objects and deep merge them safely to the properties. Creates new stamp.
Note: the merge algorithm will not change any existing `props` data of a resulting object instance.
* `@return {Object} stamp` The new stamp based on the original `this` stamp.


```js
const stamp = stampit().deepProps({
  effects: {
    amplification: 1,
    cutoff: {min: 0, max:255}
  }
});

console.log(stamp().effects.cutoff.min); // 0

const effectMashup = stamp.deepProps({effects: {cutoff: {min: 42}}})();
console.log(effectMashup.effects.cutoff.min); // 42
console.log(effectMashup.effects.cutoff.max); // 255
```


### stamp.statics(...args) and stamp.staticProperties(...args)

Take n objects and add all its properties to the stamp (aka factory object).

* `@return {Object} stamp` The new stamp based on the original `this` stamp.

```js
const stamp = stampit().statics({
  printMe() { console.log(this); }
});

stamp.printMe();
```

It used to be like that:
```js
Object.assign(stamp, {
  foo: 'foo'
});
```

But can be short written as:
```js
stamp = stamp.statics({
  foo: 'foo'
});
```


### stamp.deepStatics(...args) and stamp.deepStaticProperties(...args)

Same as `stamp.statics()` and `stamp.staticProperties()` but deeply merges the
provided objects.


### stamp.conf(...args) and stamp.configuration(...args)

Take n objects and add all its properties to the stamp's metadata. This arbitrary data could be used in initializers and static methods for your needs. Not used by stampit.

* `@return {Object} stamp` The new stamp based on the original `this` stamp.

NOTE: Accessible as `stamp.compose.configuration`. Do not confuse with the `stamp.compose.deepConfiguration`.

#### Examples

Use metadata in initializers:
```js
const stamp = stampit()
.conf({addFactorSetter: false})
.init((opts, {stamp, instance}) => {
  let factor = opts.factor || 1;
  instance.getFactor = () => factor;
  
  if (stamp.compose.configuration.addFactorSetter) {
    instance.setFactor = f => factor = f;    
  }
});

console.log(stamp().setFactor); // undefined
const stamp2 = stamp.conf({addFactorSetter: false}); 
console.log(stamp2(5).getFactor()); // 5
```

Use metadata in static functions:
```js
const stamp = stampit()
.statics({
  allowFactorSetter(allow) {
    return this.conf({addFactorSetter: !!allow})
  }
})
.init((opts, {instance, stamp}) => {
  let factor = opts.factor || 1;
  instance.getFactor = () => factor;
  
  if (stamp.compose.configuration.addFactorSetter) {
    instance.setFactor = f => factor = f;    
  }
});

console.log(stamp().setFactor); // undefined
const stamp2 = stamp.allowFactorSetter(true); 
console.log(stamp2().setFactor(5).getFactor()); // 5
```


### stamp.deepConf(...args) and stamp.deepConfiguration(...args)

Same as `stamp.conf()` and `stamp.configuration()` but deeply merges the
provided objects. This arbitrary data could be used in initializers and static methods for your needs. Not used by stampit.

* `@return {Object} stamp` The new stamp based on the original `this` stamp.

NOTE: Accessible as `stamp.compose.deepConfiguration`. Do not confuse with the `stamp.compose.configuration`.

### stamp.propertyDescriptors(...args)

Property descriptors applied to the instantiated objects. 
See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


### stamp.staticPropertyDescriptors(...args)

Property descriptors applied to the stamps. 
See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


### stamp.compose(...args)

Take one or more stamp or stamp descriptors and
combine them with `this` stamp to produce and return a new stamp.
Combining overrides properties with last-in priority.
 * `@return {Function}` A new stampit factory composed from arguments.

```js
const stamp1 = stampit({ methods: { log: console.log } });
const stamp2 = stampit({ props: { theAnswer: 42 } });

const composedStamp = stamp1.compose(stamp2);
```

### stamp.create(...args)

Alias to `stamp(...args)`.
Just like calling `stamp()`, `stamp.create()` invokes the stamp
and returns a new object instance. 

```js
const stamp = stampit().init((opts, {args}) => { console.log(...args); });
stamp.create(null, 42); // null, 42
stamp(null, 42); // null, 42
```

See more useful tips in the [advanced examples](advanced_examples.md#validate-before-a-function-call).
(NEED AN OVERHAUL FOR STAMPIT V3)

## Shortcut methods

Also available as `import {FUNCTION} from 'stampit'` or `const {FUNCTION} = require('stampit')`.

All return a new stamp exactly as the `stamp.*` methods above.

* stampit.methods()
* stampit.props()
* stampit.properties()
* stampit.init()
* stampit.initializers()
* stampit.composers()
* stampit.deepProps()
* stampit.deepProperties()
* stampit.statics()
* stampit.staticProperties()
* stampit.deepStatics()
* stampit.deepStaticProperties()
* stampit.conf()
* stampit.configuration()
* stampit.deepConf()
* stampit.deepConfiguration()
* stampit.propertyDescriptors()
* stampit.deepPropertyDescriptors()
* stampit.compose()


## Utility functions

### stampit/compose

```js
import compose from 'stampit/compose'; // or
const compose = require('stampit/compose');
```

It's a pure clean standard `compose` function implementation. See [specification](https://github.com/stampit-org/stamp-specification).

### stampit/isStamp

```js
import isStamp from 'stampit/isStamp'; // or
const isStamp = require('stampit/isStamp');
```

Take an object and return `true` if it's a stamp, `false` otherwise.

### stampit/isComposable

```js
import isComposable from 'stampit/isComposable'; // or
const isComposable = require('stampit/isComposable');
```

Take an object and return `true` if it's a stamp or a stamp descriptor.


## Chaining methods

All the methods *always* create new stamps.

```js
const MyStamp = stampit() // creates new stamp
.methods({ // creates new stamp
  methodOverride() {
    return false;
  }
})
.methods({ // creates new stamp
  methodOverride() {
    return true;
  }
})
.props({ // creates new stamp
  stateOverride: false
})
.props({ // creates new stamp
  stateOverride: true
})
.props({ // creates new stamp
  name: { first: 'John' }
})
.props({ // creates new stamp
  name: { last: 'Doe' }
})
.statics({ // creates new stamp
  staticOverride: false
})
.statics({ // creates new stamp
  staticOverride: true
})
.init(function () { // creates new stamp
  const secret = 'foo';

  this.getSecret = function () {
    return secret;
  };
})
.init(function bar() { // creates new stamp
  this.a = true;
}, function baz() {
  this.b = true;
})
.compose(AnotherStamp); // creates new stamp

MyStamp.staticOverride; // true

const obj = MyStamp();
obj.methodOverride; // true
obj.stateOverride; // true
obj.name.first && obj.name.last; // true
obj.getSecret && obj.a && obj.b; // true
```


### Pass multiple objects into all methods and functions

Every method of stampit can receive multiple arguments.
The properties from later arguments in the list will override the same named properties of previously passed in objects. 

```js
const obj = stampit()
.methods({
  a() { return 'a'; }
}, {
  b() { return 'b'; }
})
.props({
  a: 'a'
}, {
  b: 'b'
})
.init(function ({x}) {
  this.value = x;
}, function ({y}) {
  this.value = y; // overwrites previous init() effort
})
.deepProps({
  name: { first: 'John' }
}, {
  name: { last: 'Doe' }
})
.statics({
  foo: 'foo'
}, {
  bar: 'bar'
})
.compose(concreteStamp, additionalStamp, utilityStamp)
.create({x: 5, y: 10});
```


## Breaking changes

### Stampit v2

Differences with Stampit v1.

* `stampit()` now receives options object (`{methods,refs,init,props,static}`) instead of multiple arguments.
* All chaining methods return new stamps instead of self-mutating this stamp.
* `state()` always shallow merge properties. It was not doing so in a single rare case.
* Instead of factory arguments the `enclose()` functions now receive the following object `{ instance, stamp, args }`.

**New features**
* `stampit()` now receives options object (`{methods,refs,init,props,static}`) instead of multiple arguments.
* Instead of factory arguments the `enclose()` functions now receive the following object `{ instance, stamp, args }`.
* New `stamp.props()` method for deeply merged state.
* New `stamp.statics()` method which add properties to **stamp**, not an object.
* `state` deprecated. `refs` must be used instead.
* `enclose` deprecated. `init` must be used instead.
* All API functions have shortcuts now. I.e. you can write `stampit.init()` instead of `stampit().init()`. Same for methods, refs, props, static.
* All unit tests are now on `tape` instead of mocha+should.


### Stampit v3

Differences with Stampit v2.

* node.js v0.10 is not supported any more because it's maintenance period has ended.
* Stamps from stampit v2 and stampit v3 and not compatible. You should not compose them together.
* Initializers now receive two arguments instead of just one.
First is the factory first argument (i.e. `arguments[0]`), second is the same options object as before - `{ instance, stamp, args }`.

Stampit v2:
```js
const Stamp = stampit({ init({instance, stamp, args}) {
  // ...
}});
```
Stampit v3:
```js
const Stamp = stampit({ init(arg, {instance, stamp, args}) {
  console.log(arg); // 42
}});
Stamp(42);
```

* The factory first argument properties are no longer automatically assigned to the instance.

Stampit v2:
```js
const Stamp = stampit({ init({instance, stamp, args}) {
  console.log(this);
}});
Stamp({foo: 'bar'}); // {foo: "bar"}
```
Stampit v3:
```js
const Stamp = stampit({init(arg, {instance, stamp, args}) {
  console.log(this);
}});
Stamp({foo: 'bar'}); // {}
```

A workaround can be implemented as a separate behavior (stamp).
```js
const AssignFirstArgument = stampit({ init(opts) {
  Object.assign(this, opts);
}});
Stamp = AssignFirstArgument.compose(Stamp);
Stamp({foo: 'bar'}); // {foo: "bar"}
```

* A stamp's metadata is now stored in the `stamp.compose` object. Previously it was stored in `stamp.fixed` object.
* Removed `convertConstructor()`. We plan to revive it and support the ES6 classes.
* The `.props()` does not deeply merge objects any more, but shallow assigns properties. Just like `.properties()` and `.refs()`.
Use `.deepProps()` instead.
* Removed `state()`. Use `props()` instead.
* `stampit.mixin()`, `.extend()`, `.mixIn()`, `.assign()` are all gone too. Use ES6 `Object.assign()`
* `static()` got renamed to `statics()`
* The `stampit.isStamp` was moved. You should import it separately now: `require('stampit/isStamp')`.
* Initializers do not support Promises anymore. Meaning that "thenables" are not automatically unwrapped by initializers.
* The `stamp.init()` and `stampit.init()` do not support objects as incoming arguments anymore. Use ES6 `.init(Object.values(obj))` instead.

**New features**
* Stampit is compatible with the [Stamp Specification](https://github.com/stampit-org/stamp-specification/).
* You can import shortcuts and utility functions in various ways:
  * `import {statics} from 'stampit'`
  * `const {statics} = require('stampit')`
* New utility function `isComposable`. Can be imported separately: `require('stampit/isComposable')`.
* New utility function `compose`. It is the pure [standard](https://github.com/stampit-org/stamp-specification) `compose` function implementation. Can be imported separately: `require('stampit/compose')`.
* New methods on stamps (`stamp.METHOD`), as well as new shortcut methods on stampit (`stampit.METHOD`), as well as new options to stampit (`stampit({OPTION: *})`). They are: `initializers`, `init`, `composers`, `props`, `properties`, `deepProps`, `deepProperties`, `statics`, `staticProperties`, `deepStatics`, `staticDeepProperties`, `conf`, `configuration`, `deepConf`, `deepConfiguration`, `propertyDescriptors`, `staticPropertyDescriptors` 

**Other notable changes**
* The `refs` are **deprecated** now.

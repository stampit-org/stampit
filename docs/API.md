# Stampit API

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Example](#example)
- [stampit(...args)](#stampitargs)
- [The stamp object](#the-stamp-object)
  - [stamp.methods()](#stampmethods)
  - [stamp.props() and stamp.properties()](#stampprops-and-stampproperties)
  - [stamp.init([arg1] [,arg2] [,arg3...])](#stampinitarg1-arg2-arg3)
    - [Examples](#examples)
  - [stamp.deepProps() and stamp.deepProperties()](#stampdeepprops-and-stampdeepproperties)
  - [stamp.statics() and stamp.staticProperties()](#stampstatics-and-stampstaticproperties)
  - [stamp.deepStatics() and stamp.deepStaticProperties()](#stampdeepstatics-and-stampdeepstaticproperties)
  - [stamp.conf() and stamp.configuration()](#stampconf-and-stampconfiguration)
    - [Examples](#examples-1)
  - [stamp.deepConf() and stamp.deepConfiguration()](#stampdeepconf-and-stampdeepconfiguration)
  - [stamp.propertyDescriptors()](#stamppropertydescriptors)
  - [stamp.staticPopertyDescriptors()](#stampstaticpopertydescriptors)
  - [stamp.compose([arg1] [,arg2] [,arg3...])](#stampcomposearg1-arg2-arg3)
  - [stamp.create([arg1] [,arg2...])](#stampcreatearg1-arg2)
- [Shortcut methods](#shortcut-methods)
  - [stampit.isStamp(obj)](#stampitisstampobj)
  - [stampit.isComposable(obj)](#stampitiscomposableobj)
- [More Examples](#more-examples)
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
 * `@return {Function} stamp.deepProps` Add deeply cloned properties to the produced objects. Returns a new stamp
 * `@return {Function} stamp.deepProperties` Same as `stamp.deepProps`
 * `@return {Function} stamp.static` Add properties to the factory object. Returns a new stamp
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


### stamp.methods()

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

### stamp.props() and stamp.properties()

Take n objects and add them to the references list of a new stamp. Creates new stamp.
* `@return {Object} stamp` The new stamp based on the original `this` stamp.

```js
const stamp = stampit().props({
  factor: 1
});

console.log(stamp().factor); // 1
console.log(stamp({factor: 5}).factor); // 5
```


### stamp.init([arg1] [,arg2] [,arg3...])

Take n functions, an array of functions, or n objects and add
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


### stamp.deepProps() and stamp.deepProperties()

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

const effectMashup = stamp({effects: {cutoff: {min: 42}}});
console.log(effectMashup.effects.cutoff.min); // 42
console.log(effectMashup.effects.cutoff.max); // 255
```


### stamp.statics() and stamp.staticProperties()

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


### stamp.deepStatics() and stamp.deepStaticProperties()

Same as `stamp.statics()` and `stamp.staticProperties()` but deeply merges the
provided objects.


### stamp.conf() and stamp.configuration()

Take n objects and add all its properties to the stamp's metadata. This arbitrary data could be used in initializers and static methods for your needs. Not used by stampit.

* `@return {Object} stamp` The new stamp based on the original `this` stamp.

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
.init((opts, {stamp}) => {
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


### stamp.deepConf() and stamp.deepConfiguration()

Same as `stamp.conf()` and `stamp.configuration()` but deeply merges the
provided objects. This arbitrary data could be used in initializers and static methods for your needs. Not used by stampit.


### stamp.propertyDescriptors()

Property descriptors applied to the instantiated objects. 
See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


### stamp.staticPopertyDescriptors()

Property descriptors applied to the stamps. 
See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


### stamp.compose([arg1] [,arg2] [,arg3...])

Take one or more stamp or stamp descriptors and
combine them with `this` stamp to produce and return a new stamp.
Combining overrides properties with last-in priority.
 * `@return {Function}` A new stampit factory composed from arguments.

```js
const stamp1 = stampit({ methods: { log: console.log } });
const stamp2 = stampit({ props: { theAnswer: 42 } });

const composedStamp = stamp1.compose(stamp2);
```

### stamp.create([arg1] [,arg2...])

Alias to `stamp([arg1] [,arg2...])`.
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

All return a new stamp.

* stampit.methods()
* stampit.props()
* stampit.properties()
* stampit.init()
* stampit.initializers()
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

### stampit.isStamp(obj)

Take an object and return `true` if it's a stamp, `false` otherwise.

### stampit.isComposable(obj)

Take an object and return `true` if it's a stamp or a stamp descriptor.


## More Examples

## Chaining methods

Chaining stamps *always* creates new stamps.

```js
const MyStamp = stampit()
.methods({
  methodOverride() {
    return false;
  }
})
.methods({
  methodOverride() {
    return true;
  }
})
.props({
  stateOverride: false
})
.props({
  stateOverride: true
})
.props({
  name: { first: 'John' }
})
.props({
  name: { last: 'Doe' }
})
.statics({
  staticOverride: false
})
.statics({
  staticOverride: true
})
.init(function () {
  const secret = 'foo';

  this.getSecret = function () {
    return secret;
  };
})
.init(function bar() {
  this.a = true;
}, function baz() {
  this.b = true;
})
.compose(AnotherStamp);

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
.init(function () {
  console.log(this);
}, function () {
  console.log(this); // same as above
})
.props({
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
.create();
```


## Breaking changes

### Stampit v2

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

* Thus, the factory first argument properties are no longer automatically assigned to the instance.

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

* A stamp's metadata is now stored in the `stamp.compose` object. Previously it was stored in `stamp.fixed` object.
* Removed `convertConstructor()` (we plan to revive it supporting ES6 classes)
* Removed `state()`. Use `props()` instead.
* `stampit.mixin()`, `.extend()`, `.mixIn()`, `.assign()` are all gone too. Use `Object.assign()`
* `static()` got renamed to `statics()`

**New features**
* Stampit is compatible with the [Stamp Specification](https://github.com/stampit-org/stamp-specification/).
* You can import shortcut and utility functions in various ways:
  * `import {statics} from 'stampit'`
  * `const {statics} = require('stampit')`
* New utility function `isComposalbe`. Can be imported in any of the above ways.
* New methods on stamps, as well as new shortcut methods on stampit, as well as new options to `stampit()`: `initializers`, `properties`, `deepProps`, `deepProperties`, `deepStatics`, `conf`, `configuration`, `deepConf`, `deepConfiguration`, `propertyDescriptors`, `staticPropertyDescriptors` 

**Other notable changes**
* The `refs` are **deprecated**

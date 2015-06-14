<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [`object.getStamp()`. 2 ways.](#objectgetstamp-2-ways)
  - [First way](#first-way)
  - [Second way](#second-way)
- [](#)
- [Self cloneable objects. 3 ways.](#self-cloneable-objects-3-ways)
  - [A composable stamp which adds `.clone()` to objects](#a-composable-stamp-which-adds-clone-to-objects)
  - [Another way of self cloning](#another-way-of-self-cloning)
  - [Memory efficient cloning](#memory-efficient-cloning)
- [](#-1)
- [Delayed object instantiation using Promises](#delayed-object-instantiation-using-promises)
- [](#-2)
- [Dependency injection tips](#dependency-injection-tips)
- [](#-3)
- [Validate before a function call](#validate-before-a-function-call)
- [](#-4)
- [EventEmitter without inheritance (`convertConstructor`)](#eventemitter-without-inheritance-convertconstructor)
- [](#-5)
- [Hacking stamps](#hacking-stamps)
  - ["Default" properties](#default-properties)
  - ["Default" properties as composable behavior](#default-properties-as-composable-behavior)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## `object.getStamp()`. 2 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ node stampit/advanced-examples/self-aware.js
```

You can add `.getStamp()` function to each object with ease. 

First, let's assume you have a following stamp:
```js
var User = stampit();
```

### First way
Just compose the following stamp to any other stamp.
```js
var SelfAware1 = stampit.init(function (ctx) { // the context, has `stamp` property
  this.getStamp = function () { return ctx.stamp; }
});
```
Let's compose it with the `User` stamp from above:
```js
var SelfAwareUser1 = User.compose(SelfAware1);
```
Now, let's create a user and call the `.getStamp()`:
```js
var user1 = SelfAwareUser1();
assert.strictEqual(user1.getStamp(), SelfAwareUser1); // All good
```
So, now every object instance returns the exact stamp it was built with. Nice!

### Second way
Another composable stamp which does the same but in a memory efficient way.
It attaches the function to the `.prototype` of the objects, but not to each one.
```js
var SelfAware2 = stampit.init(function (ctx) { // the context, has `stamp` property
  if (!ctx.stamp.fixed.methods.getStamp) { // Let's add the method only once.
    var stamp = ctx.stamp; // We should reference only one object, otherwise it is memory leak risky
    ctx.stamp.fixed.methods.getStamp = function () { return stamp; }
  }
});
```
The `ctx.stamp.fixed` property contains stamp's internal data.
The `fixed.methods` object is used as all object instances' `.prototype`.

Compose this new stamp with our `User` from above:
```js
var SelfAwareUser2 = User.compose(SelfAware2);
```
Let's test it:
```js
var user2 = SelfAwareUser2();
assert.strictEqual(user2.getStamp(), SelfAwareUser2); // All good
```
And again, every new object instance knows which stamp it was made of. Brilliant!

------------------------------

## Self cloneable objects. 3 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ node stampit/advanced-examples/cloneable.js
```

This is simple stamp with a single method and a single data property.
```js
var PrependLogger = stampit.methods({
  log: function (data) {
    console.log(this.prefix, data);
  }
}).refs({
  prefix: 'STDOUT: '
});
```
Using it:
```js
var logger = PrependLogger();
logger.log('hello');
```
Prints `STDOUT: hello`

### A composable stamp which adds `.clone()` to objects

Let's implement a stamp which allows **any** object to be safely cloned: 
```js
var Cloneable = stampit.init(function (ctx) { // the context, has `stamp` and `instance` properties
  this.clone = function () { return ctx.stamp(ctx.instance); };
});
```
All the properties of the object `instance` will be copied by reference to the new object
when calling the factory - `stamp(instance)`.

Compose it with our `PrependLogger` from above:
```js
var CloneablePrependLogger = PrependLogger.compose(Cloneable);
```
Let's create an instance, then clone it, and see the result:
```js
var logger = CloneablePrependLogger({ prefix: 'OUT: ' }); // creating first object
var loggerClone = logger.clone(); // cloning the object.
logger.log('hello'); // OUT: hello
loggerClone.log('hello'); // OUT: hello
```
Prints
```
OUT: hello
OUT: hello
```
The `logger` and `loggerClone` work exactly the same. Woah! 

### Another way of self cloning

This is how you can implement self cloning different: 
```js
var Cloneable = stampit.init(function (ctx) {
  this.clone = ctx.stamp.bind(null, this);
});
```
Stamp is a regular function, so we simply bound its first argument to the object instance.
All the properties of the object instance will be copied by reference to the new object.

Composing it with our `PrependLogger` from above:
```js
var CloneablePrependLogger = PrependLogger.compose(Cloneable);
```
Create an instance, then clone it, and see the result:
```js
var logger = CloneablePrependLogger({ prefix: 'OUT: ' }); // creating first object
var loggerClone = logger.clone(); // cloning the object.
logger.log('hello'); // OUT: hello
loggerClone.log('hello'); // OUT: hello
```
Prints
```
OUT: hello
OUT: hello
```
Objects have the same state again. Awesome!

### Memory efficient cloning

Let's reimplement the `Cloneable` stamp so that the `clone()` function is not attached 
to every object but to the prototype. This will save us a little bit of memory per object.
```js
var Cloneable = stampit.init(function (ctx) {
  if (!ctx.stamp.fixed.methods.clone) { // check if prototype has the clone() method already
    var stamp = ctx.stamp; // Avoiding too much data referenced and potential memory leaks
    ctx.stamp.fixed.methods.clone = function () { return stamp(this) };
  }
});
```
The `ctx.stamp.fixed` property contains stamp's internal data.
The `fixed.methods` object is used as all object instances' `.prototype`.
Compose this new stamp with our `PrependLogger` from above:
```js
var CloneablePrependLogger = PrependLogger.compose(Cloneable);
```
Let's see how it works:
```js
var logger = CloneablePrependLogger({ prefix: 'OUT: ' }); // creating first object
var loggerClone = logger.clone(); // cloning the object.
logger.log('hello'); // OUT: hello
loggerClone.log('hello'); // OUT: hello
```
Prints
```
OUT: hello
OUT: hello
```
Memory efficient and safe cloning for each object. Yay!

------------------------------

## Delayed object instantiation using Promises

What if you can't create an object right now but have to retrieve data from a server or filesystem?

To solve this we can make **any** stamp to return `Promise` instead of object itself.

First, let's assume you have this stamp:
```js
var User = stampit.refs({ entityName: 'user' });
```

The following stamp should be composed *the last*, otherwise it won't work.
```js
var AsyncInitializable = stampit.refs({
  db: mongo.connection
}).methods({
  getEntity: function(id) { // Gets id and return Promise which resolves into DB entity.
    return Promise.resolve(this.db[this.entityName].getById(id));
  }
}).init(() => {
  // If we return anything from an .init() function it becomes our object instance.
  return this.getEntity(this.id);
});
```
Let's compose it with our `User` stamp:
```js
var AsyncInitializableUser = User.compose(AsyncInitializable); // The stamp produces promises now.
```
Create object (ES6):
```js
var userEntity = yield AsyncInitializableUser({ id: '42' });
```
A random stamp received the behaviour which creates objects asynchronously. OMG!

------------------------------

## Dependency injection tips

Using the [node-dm](https://www.npmjs.com/package/node-dm) dependency management module you can
receive preconfigured objects if you pass a stamp to it. It's possible because stamps are functions.

Self printing behaviour. An object will log itself after being created.
```js
var PrintSelf = stampit.init(function() {
  console.log(this); // same as console.log(ctx.instance) but shorter
});
```
Supply the self printing stamp to the dependency manager:
```js
dm.resolve({db: true, config: true, pi: true}).then(PrintSelf);
```
Will print all the properties passed to it by the dependency manager module:
```
{ db: ...
  config: ...
  pi: ... }
```

------------------------------

## Validate before a function call

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ node stampit/advanced-examples/prevalidate.js
```

For example you can prevalidate the object instance before a function call.

This stamp separates the function definition and the prevalidation logic:
```js
var UserWithValidation = stampit.methods({
  authorise: function () {
    return true || false; // dummy implementation
  }
}).init(function () {
  var authorise = this.authorise; // Replacing function.
  this.authorise = function () {
    // Do our validation logic. It can be anything really.
    if (this.user &&
      !_.isEmpty(this.user.name) && !_.isEmpty(this.user.password) &&
      _.isString(this.user.name) && _.isString(this.user.password)) {
      return authorise.apply(this, arguments); // call the original function if all went fine.
    }

    // Validation failed. Do something like throwing error.
    throw new Error('user data is missing')
  }.bind(this);
});
```
Let's try it:
```js
var user = UserWithValidation({user: {name: 'john', password: ''}}); // password is missing
user.authorise(); // throws "Error: user data is missing"
```
The code will throw error because password is missing.

You can replace silly `if`-validation logic with
[joi](https://www.npmjs.com/package/joi) or [strummer](https://www.npmjs.com/package/strummer) or 
[is-my-json-valid](https://www.npmjs.com/package/is-my-json-valid) module usage.

The point here is that validation of data and data usage can be split apart and combined back when needed.

------------------------------

## EventEmitter without inheritance (`convertConstructor`)

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ node stampit/advanced-examples/event-emitter.js
```

You can have a stamp which makes aby object an `EventEmitter` without inheriting from it.

```js
var EventEmitter = require('events').EventEmitter;
var EventEmittable = stampit.convertConstructor(EventEmitter);
```
We have just used a special utility function `convertConstructor`.
It converts classic JavaScript "classes" to a composable stamp.

Let's compose it with any other stamp:
```js
var User = stampit.refs({ name: { first: "(unnamed)", last: "(unnamed)" } });
var EmittableUser = User.compose(EventEmittable);
var user = EmittableUser({ name: { first: "John", last: "Doe" } });
```
Now, let's subscribe and emit an event.
```js
user.on('name', console.log); // Does not throw exceptions like "user.on() has no method 'on'"
user.emit('name', user.name); // correctly handled by the object.
```
Will print `{ first: "John", last: "Doe" }`.

As of stampit v2 the `convertConstructor` has limitations. It can't handle constructors with arguments. 

------------------------------

## Hacking stamps

Each stamp has the property `fixed`. It's an object with 4 properties. It's used by stampit in that order:
* `Stamp.fixed.methods` - plain object. Stampit uses it to set new objects' prototype: `Object.create(fixed.methods)`.
* `Stamp.fixed.refs` - plain object. Stampit uses it to set new objects' state: `_.assign(obj, fixed.refs)`.
* `Stamp.fixed.props` - plain object. Stampit deeply merges it into new objects: `_.merge(obj, fixed.props)`.
* `Stamp.fixed.init` - array of functions. Stampit calls them sequentially: `fixed.init.forEach(fn => fn.call(obj))`.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ node stampit/advanced-examples/hacking.js
```

### "Default" properties

You can add "default" state by changing `Stamp.fixed.methods`.
```js
var Stamp = stampit();
Stamp.fixed.methods.data = 1;
var instance = Stamp();
console.log(instance.data); // 1
```
Will print `1`. But let's add some state:
```js
var instance2 = Stamp({ data: 2 });
console.log(instance2.data); // 2
```
Will print `2`. But let's delete this property from the instance.
```js
delete instance2.data;
console.log(instance2.data); // 1
```
Will print `1`. The `data` was removed from the object instance, but not from its prototype.

### "Default" properties as composable behavior

Let's enforce default values to new object instances.
```js
var ForcedDefaults = stampit.init(function (ctx) {
  stampit.mixin(ctx.stamp.fixed.methods, this._enforcedDefaults);
});
```
The stamp above will add all the `_enforcedDefaults` to the `.prototype`.

Let's create user name and password enforcement.
```js
var DefaultDbCredentials = ForcedDefaults.refs({ _enforcedDefaults: { user: { name: "guest", password: "guest" } } });
```
Now, assume we have a `DbConnection` stamp.
```js
var DbConnection = stampit(); // whatever it is...
```
Let's make the `DbConnection` to connect regardless if credentials were supplied or not.
```js
var DbConnectionWithDefaults = DbConnection.compose(DefaultDbCredentials);
```
Let's create two connections: with and without user credentials:
```js
var connectionWithoutCredentials = DbConnectionWithDefaults();
console.log(connectionWithoutCredentials.user);

var connectionWithCredentials = DbConnectionWithDefaults({ user: { name: "admin", password: "123" } });
console.log(connectionWithCredentials.user);
```
Will print:
```
{ user: { name: "guest", password: "guest" } }
{ user: { name: "admin", password: "123" } }
```

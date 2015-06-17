<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [`object.getStamp()`. 2 ways.](#objectgetstamp-2-ways)
  - [First way](#first-way)
  - [Second way](#second-way)
- [Self cloneable objects. 3 ways.](#self-cloneable-objects-3-ways)
  - [A composable stamp which adds `.clone()` to objects](#a-composable-stamp-which-adds-clone-to-objects)
  - [Another way of self cloning](#another-way-of-self-cloning)
  - [Memory efficient cloning](#memory-efficient-cloning)
- [Delayed object instantiation using Promises](#delayed-object-instantiation-using-promises)
- [Dependency injection tips](#dependency-injection-tips)
- [Validate before a function call](#validate-before-a-function-call)
- [EventEmitter without inheritance (`convertConstructor`)](#eventemitter-without-inheritance-convertconstructor)
- [Hacking stamps](#hacking-stamps)
  - ["Default" properties](#default-properties)
  - ["Default" properties as composable behavior](#default-properties-as-composable-behavior)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## `object.getStamp()`. 2 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ cd stampit && npm i babel -g
$ babel-node advanced-examples/self-aware.js
```

You can add `.getStamp()` function to each object with ease. 

First, let's assume you have a following stamp:
```js
const User = stampit();
```

### First way
Just compose the following stamp to any other stamp.
```js
const SelfAware1 = stampit.init(({ instance, stamp }) => {
  instance.getStamp = () => stamp;
});
```
Let's compose it with the `User` stamp from above:
```js
const SelfAwareUser1 = User.compose(SelfAware1);
```
Now, let's create a user and call the `.getStamp()`:
```js
const user1 = SelfAwareUser1();
assert.strictEqual(user1.getStamp(), SelfAwareUser1); // All good
```
So, now every object instance returns the exact stamp it was built with. Nice!

### Second way
Another composable stamp which does the same but in a memory efficient way.
It attaches the function to the `.prototype` of the objects, but not to each one.
```js
const SelfAware2 = stampit.init(({ instance, stamp }) => {
  if (instance.getStamp) {
    stamp.fixed.methods.getStamp = () => stamp;
  }
});
```
The `ctx.stamp.fixed` property contains stamp's internal data.
The `fixed.methods` object is used as all object instances' `.prototype`.

Compose this new stamp with our `User` from above:
```js
const SelfAwareUser2 = User.compose(SelfAware2);
```
Let's test it:
```js
const user2 = SelfAwareUser2();
assert.strictEqual(user2.getStamp(), SelfAwareUser2); // All good
```
And again, every new object instance knows which stamp it was made of. Brilliant!

------------------------------

## Self cloneable objects. 3 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ cd stampit && npm i babel -g
$ babel-node advanced-examples/cloneable.js
```

This is simple stamp with a single method and a single data property.
```js
const PrependLogger = stampit.methods({
  log: function (data) {
    console.log(this.prefix, data);
  }
}).state({
  prefix: 'STDOUT: '
});
```
Using it:
```js
const originalLogger = PrependLogger();
originalLogger.log('hello');
```
Prints `STDOUT: hello`

### A composable stamp which adds `.clone()` to objects

Let's implement a stamp which allows **any** object to be safely cloned: 
```js
const Cloneable1 = stampit.init(({ instance, stamp }) => {
  instance.clone = () => stamp(instance);
});
```
All the properties of the object `instance` will be copied by reference to the new object
when calling the factory - `stamp(instance)`.

Compose it with our `PrependLogger` from above:
```js
const CloneablePrependLogger1 = PrependLogger.compose(Cloneable1);
```
Let's create an instance, then clone it, and see the result:
```js
const logger1 = CloneablePrependLogger1({ prefix: 'OUT: ' }); // creating first object
const loggerClone1 = logger1.clone(); // cloning the object.
logger1.log('hello'); // OUT: hello
loggerClone1.log('hello'); // OUT: hello
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
const Cloneable2 = stampit.init(({ instance, stamp }) => {
  instance.clone = stamp.bind(null, instance);
});
```
Stamp is a regular function, so we simply bound its first argument to the object instance.
All the properties of the object instance will be copied by reference to the new object.

Composing it with our `PrependLogger` from above:
```js
const CloneablePrependLogger2 = PrependLogger.compose(Cloneable2);
```
Create an instance, then clone it, and see the result:
```js
const logger2 = CloneablePrependLogger2({ prefix: 'OUT: ' }); // creating first object
const loggerClone2 = logger2.clone(); // cloning the object.
logger2.log('hello'); // OUT: hello
loggerClone2.log('hello'); // OUT: hello
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
const Cloneable3 = stampit.init(({ instance, stamp }) => {
  if (!stamp.clone) { // check if prototype is already has the clone() method
    stamp.fixed.methods.clone = function () { return stamp(this); };
  }
});
```
The `ctx.stamp.fixed` property contains stamp's internal data.
The `fixed.methods` object is used as all object instances' `.prototype`.
Compose this new stamp with our `PrependLogger` from above:
```js
const CloneablePrependLogger3 = PrependLogger.compose(Cloneable3);
```
Let's see how it works:
```js
const logger3 = CloneablePrependLogger3({ prefix: 'OUT: ' });  // creating first object
const loggerClone3 = logger3.clone(); // cloning the object.
logger3.log('hello'); // OUT: hello
loggerClone3.log('hello'); // OUT: hello
```
Prints
```
OUT: hello
OUT: hello
```
Memory efficient and safe cloning for each object. Yay!

------------------------------

## Delayed object instantiation using Promises

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ cd stampit && npm i babel -g
$ babel-node advanced-examples/delayed-instantiation.js
```

What if you can't create an object right now but have to retrieve data from a server or filesystem?

To solve this we can make **any** stamp to return `Promise` instead of object itself.

First, let's assume you have this stamp:
```js
const User = stampit.refs({ entityName: 'user' });
```

The following stamp should be composed *the last*, otherwise it won't work.
```js
const AsyncInitializable = stampit.refs({
  db: { user: { getById() { return Promise.resolve({ name: { first: 'John', last: 'Snow' }}) } } } // mocking a DB
}).methods({
  getEntity: function(id) { // Gets id and return Promise which resolves into DB entity.
    return Promise.resolve(this.db[this.entityName].getById(id));
  }
}).init(function () {
  // If we return anything from an .init() function it becomes our object instance.
  return this.getEntity(this.id);
});
```
Let's compose it with our `User` stamp:
```js
const AsyncInitializableUser = User.compose(AsyncInitializable); // The stamp produces promises now.
```
Create object (ES6):
```js
const userEntity = AsyncInitializableUser({ id: '42' }).then(console.log);
```
A random stamp received the behaviour which creates objects asynchronously. OMG!

------------------------------

## Dependency injection tips

Using the [node-dm](https://www.npmjs.com/package/node-dm) dependency management module you can
receive preconfigured objects if you pass a stamp to it. It's possible because stamps are functions.

Self printing behaviour. An object will log itself after being created.
```js
const PrintSelf = stampit.init(({ instance }) => {
  console.log(instance);
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
$ cd stampit && npm i babel -g
$ npm i joi
$ babel-node advanced-examples/prevalidate.js
```

For example you can prevalidate an object instance before a function call.

First, let's assume you have this stamp:
```js
const User = stampit.methods({
  authorize: function () {
    // dummy implementation. Don't bother. :)
    return this.authorized = (this.user.name === 'john' && this.user.password === '123');
  }
});
```
It requires the user object to have both name and password set.

Now, let's implement a stamp which validates a state just before a function call.
```js
const JoiPrevalidator = stampit
  .static({ // Adds properties to stamps, not object instances.
    prevalidate(methodName, schema) {
      var prevalidations = this.fixed.refs.prevalidations || {}; // Taking existing validation schemas
      prevalidations[methodName] = schema; // Adding/overriding a validation schema.
      return this.refs({prevalidations}); // Cloning self and (re)assigning a reference.
    }
  })
  .init(function () { // This will be called for each new object instance.
    _.forOwn(this.prevalidations, (value, key) => { // overriding functions
      const actualFunc = this[key];
      this[key] = () => { // Overwrite a real function with ours.
        const result = joi.validate(this, value, {allowUnknown: true});
        if (result.error) {
          throw new Error(`Can't call ${key}(), prevalidation failed: ${result.error}`);
        }

        return actualFunc.apply(this, arguments);
      }
    });
  });
```
Note, you can validate anything in any way you want and need.

Compose the new validator stamp with our `User` stamp:
```js
const UserWithValidation = User.compose(JoiPrevalidator) // Adds new method prevalidate() to the stamp.
  .prevalidate('authorize', { // Setup a prevalidation rule using our new "static" function.
    user: { // Joi schema.
      name: joi.string().required(),
      password: joi.string().required()
    }
  });
```

Let's try it:
```js
const okUser = UserWithValidation({user: {name: 'john', password: '123'}});
okUser.authorize(); // No error. Validation successful.
console.log('Authorised:', okUser.authorized);

const throwingUser = UserWithValidation({user: {name: 'john', password: ''}});
throwingUser.authorize(); // will throw an error because password is absent
```
Will print `Authorised: true` and then an error stack. The code throws an error because the password is missing.

You can replace `joi` validation logic with
[strummer](https://www.npmjs.com/package/strummer) or 
[is-my-json-valid](https://www.npmjs.com/package/is-my-json-valid) or any other module.

So, now you have a **composable** behavior to validate any function just before it's called. Incredible!

------------------------------

## EventEmitter without inheritance (`convertConstructor`)

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ cd stampit && npm i babel -g
$ babel-node advanced-examples/event-emitter.js
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
$ cd stampit && npm i babel -g
$ babel-node advanced-examples/hacking.js
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
var DefaultUserCredentials = ForcedDefaults.refs({ _enforcedDefaults: { user: { name: "guest", password: "guest" } } });
```
Now, assume we have a `DbConnection` stamp.
```js
var DbConnection = stampit(); // whatever it is...
```
Let's make the `DbConnection` to connect regardless if credentials were supplied or not.
```js
var DbConnectionWithDefaults = DbConnection.compose(DefaultUserCredentials);
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

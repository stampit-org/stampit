This is a set of handy **composable** stamps, as well as few tips and tricks.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Self aware objects - `instance.getStamp()`. 2 ways.](#self-aware-objects---instancegetstamp-2-ways)
  - [Attach function to object](#attach-function-to-object)
  - [Attach function to prototype (memory efficient)](#attach-function-to-prototype-memory-efficient)
- [Self cloneable objects - `instance.clone()`. 2 ways.](#self-cloneable-objects---instanceclone-2-ways)
  - [Attach method to each object instance](#attach-method-to-each-object-instance)
  - [Attach function to prototype (memory efficient)](#attach-function-to-prototype-memory-efficient-1)
- [Validate before a function call](#validate-before-a-function-call)
- [EventEmitter as a composable behavior](#eventemitter-as-a-composable-behavior)
- [Mocking in the unit tests](#mocking-in-the-unit-tests)
- [Hacking stamps](#hacking-stamps)
  - [Enforced default properties](#enforced-default-properties)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Self aware objects - `instance.getStamp()`. 2 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git && cd stampit
$ node advanced-examples/self-aware.js
```

You can add `.getStamp()` function to each object with ease. 

First, let's assume you have a following stamp:
```js
const User = stampit();
```

### Attach function to object
Just compose the following stamp to any other stamp.
```js
const SelfAware = stampit.init((opts, { instance, stamp }) => {
  instance.getStamp = () => stamp;
});
```
Let's compose it with the `User` stamp from above:
```js
const SelfAwareUser = User.compose(SelfAware);
```
Now, let's create a user and call the `.getStamp()`:
```js
const user = SelfAwareUser();
assert.strictEqual(user.getStamp(), SelfAwareUser); // All good
```
So, now every object instance returns the exact stamp it was built with. Nice!

### Attach function to prototype (memory efficient)
Another composable stamp which does the same but in a memory efficient way.
It attaches the function to the `.prototype` of the objects, but not to each one.

We'll use the `composers` feature of stampit as the simplest and safest way to implement that.
The `methods` object of stamps becomes its objects prototype. So, we'll attach our method to it.
```js
const SelfAware2 = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {}; // make sure it exists 
  stamp.compose.methods.getStamp = () => stamp;
});
```
The `stamp.compose` property contains stamp's internal data.
The `stamp.compose.methods` object is used as all objects instances' `.prototype`.

Compose this new stamp with our `User` from above:
```js
const SelfAwareUser = User.compose(SelfAware2);
```
Let's test it:
```js
const user = SelfAwareUser();
assert.strictEqual(user.getStamp(), SelfAwareUser); // All good
```
And again, every new object instance knows which stamp it was made of. Brilliant!

------------------------------

## Self cloneable objects - `instance.clone()`. 2 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git && cd stampit
$ node advanced-examples/cloneable.js
```

This is a simple stamp with an initializer, a single method, and a single property `prefix`.
```js
const PrependLogger = stampit.init((opts, { instance }) => {
  if (opts.prefix) instance.prefix = opts.prefix;
})
.methods({
  log(obj) {
    console.log(this.prefix, obj);
  }
}).props({
  prefix: 'STDOUT: '
});
```
Using it:
```js
const originalLogger = PrependLogger();
originalLogger.log('hello');
```
Prints `STDOUT: hello`

### Attach method to each object instance

Let's implement a stamp which allows **any** object to be safely cloned: 
```js
const Cloneable = stampit.init((opts, { instance, stamp }) => {  
  instance.clone = () => Object.assign(stamp(), instance);
});
```
All the properties of the object `instance` will be copied by reference to the new object
using the - `Object.assign`.

Compose it with our `PrependLogger` from above:
```js
const CloneablePrependlogger = PrependLogger.compose(Cloneable);
```
Let's create an instance, then clone it, and see the result:
```js
const logger = CloneablePrependlogger({ prefix: 'OUT: ' }); // creating first object
const loggerClone = logger.clone(); // cloning the object.
logger.log('hello'); // OUT: hello
loggerClone.log('hello'); // OUT: hello
```
Prints
```
OUT: hello
OUT: hello
```
The `logger` and `loggerClone` work exactly the same. Woah! 

### Attach function to prototype (memory efficient)

Let's reimplement the `Cloneable` stamp so that the `clone()` function is not attached 
to every object but to the prototype. This will save us a little bit of memory per object.

We'll use the `composers` feature of stampit as the simplest and safest way to implement that.
The `methods` object of stamps becomes its objects prototype. So, we'll attach our method to it.
```js
const Cloneable2 = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {}; // make sure it exists 
  stamp.compose.methods.clone = function () { return Object.assign(stamp(), this); };
});
```
The `stamp.compose` property contains stamp's internal data.
The `stamp.compose.methods` object is used as all object instances' `.prototype`.
Compose this new stamp with our `PrependLogger` from above:
```js
const CloneablePrependlogger = PrependLogger.compose(Cloneable2);
```
Let's see how it works:
```js
const logger = CloneablePrependlogger({ prefix: 'OUT: ' });  // creating first object
const loggerClone = logger.clone(); // cloning the object.
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

## Validate before a function call

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git && cd stampit
$ npm i joi
$ node advanced-examples/prevalidate.js
```

For example you can prevalidate an object instance before a function call.

First, let's assume you have this stamp:
```js
const User = stampit.init((opts, {instance}) => {
  if (opts.user) instance.user = opts.user;
})
.methods({
  authorize() {
    // dummy implementation. Don't bother. :)
    return this.authorized = (this.user.name === 'john' && this.user.password === '123');
  }
});
```
It requires the `user` object to have both `name` and `password` set.

Now, let's implement a stamp which validates a state just before a function call.
```js
const JoiPrevalidator = stampit
  .statics({ // Adds properties to stamps, not object instances.
    prevalidate(methodName, schema) {
      this.compose.configuration = this.compose.configuration || {};
      const prevalidations = this.compose.configuration.prevalidations || {}; // Taking existing validation schemas
      prevalidations[methodName] = schema; // Adding/overriding a validation schema.
      return this.conf({prevalidations}); // Cloning self and (re)assigning a reference.
    }
  })
  .init(function (opts, {stamp}) { // This will be called for each new object instance.
    _.forOwn(stamp.compose.configuration.prevalidations, (value, key) => { // overriding functions
      const actualFunc = this[key];
      this[key] = ( ...args ) => { // Overwrite a real function with ours.
        const result = joi.validate(this, value, {allowUnknown: true});
        if (result.error) {
          throw new Error(`Can't call ${key}(), prevalidation failed: ${result.error}`);
        }

        return actualFunc.apply(this, args);
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
console.log('Authorized:', okUser.authorized);

const throwingUser = UserWithValidation({user: {name: 'john', password: ''}});
throwingUser.authorize(); // will throw an error because password is absent
```
Will print `Authorized: true` and then an error stack. The code throws an error because the password is missing.

You can replace `joi` validation logic with
[strummer](https://www.npmjs.com/package/strummer) or 
[is-my-json-valid](https://www.npmjs.com/package/is-my-json-valid) or any other module.

So, now you have a **composable** behavior to validate any function just before it's called. Incredible!

------------------------------

## EventEmitter as a composable behavior

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git && cd stampit
$ node advanced-examples/event-emitter.js
```

You can have a stamp which makes any object an `EventEmitter` without inheriting from it.

```js
const EventEmitter = require('events').EventEmitter;
```

We'll use the `composers` feature of stampit as the simplest and safest way to implement that.
The `methods` object of stamps becomes its objects prototype. So, we'll make it an event emitter.
```js
const EventEmittable = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {}; // make sure it exists
  Object.setPrototypeOf(stamp.compose.methods, EventEmitter.prototype);
});
```
We have just used a special utility function `convertConstructor`.
It converts classic JavaScript "classes" to a composable stamp.

Let's compose it with any other stamp:
```js
const User = stampit.init((opts, {instance}) => {
  if (opts.name) instance.name = opts.name;
})
.props({
  name: { first: "(unnamed)", last: "(unnamed)" }
});
const EmittableUser = User.compose(EventEmittable);
const user = EmittableUser({ name: { first: "John", last: "Doe" } });
```
Now, let's subscribe and emit an event.
```js
user.on('name', console.log); // Does not throw exceptions, e.g. "'user' has no method 'on'"
user.emit('name', user.name); // correctly handled by the object.
```
Will print `{ first: "John", last: "Doe" }`.

------------------------------

## Mocking in the unit tests

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git && cd stampit
$ node advanced-examples/mocking.js
```

Consider the following stamp composition:
```js
const NewStamp = AStamp.compose(FirstStamp, SecondsStamp);
```
Last composed stamp always wins. This means that `SecondStamp` will override methods 
of the `AStamp` and `FirstStamp` if case of conflicts. Let's use this feature to override DB calls with mock functions.

Define few following stamps:
```js
/**
 * Implements convertOne() method for future usage.
 */
const DbToApiCommodityConverter = stampit.methods({
  convertOne(entity) {
    var keysMap = {_id: 'id'};
    return _.mapKeys(_.pick(entity, ['category', '_id', 'name', 'price']), (v, k) => keysMap[k] || k);
  }
});

/**
 * Abstract converter. Implements convert() which does argument validation and can convert both arrays and single items.
 * Requires this.convertOne() to be defined.
 */
const Converter = stampit.methods({
  convert(entities) {
    if (!entities) {
      return;
    }

    if (!Array.isArray(entities)) {
      return this.convertOne(entities);
    }

    return _.map(entities, this.convertOne);
  }
});

/**
 * Database querying implementation: findById() and find()
 * Requires this.schema to be defined.
 */
const MongoDb = stampit.methods({
  findById(id) {
    return this.schema.findById(id);
  },

  find(params) {
    return this.schema.find(params);
  }
});
```

Okay, let's define few business logic functions to retrieve data from the DB using the stamps above:
```js
/**
 * The business logic. Defines getById() and search() which query DB and convert data with this.convert().
 * Requires this.convert(), this.findById(), and this.find() to be defined.
 */
const Commodity = stampit.methods({
  getById(id) {
    return this.findById(id).then(this.convert.bind(this));
  },

  search(fields = {price: {from: 0, to: Infinity}}) {
    return this.find({category: fields.categories, price: {gte: fields.price.from, lte: fields.price.to}})
      .then(this.convert.bind(this));
  }
}).compose(Converter, DbToApiCommodityConverter, MongoDb); // Adding the missing behavior
```

The usage is quite straightforward.
```js
const commodity = Commodity({
  schema: MongooseCommoditySchema
});

commodity.getById(42).then(console.log);
commodity.find({categories: 'kettle', price: {from: 0, to: 20}}).then(console.log);
```

Finally, the mocking! All we need to do is to have a stamp with the `findById()` and `find()` methods.
```js
const _mockItem = {category: 'kettle', _id: 42, name: 'Samsung Kettle', price: 4.2};
const FakeDb = stampit.methods({
  findById(id) { // Mocking the DB call
    return Promise.resolve(_mockItem);
  },
  find(params) { // Mocking the DB call
    return Promise.resolve([_mockItem]);
  }
});
```

Let's test.
```js
const MockedCommodity = Commodity.compose(FakeDb);

const commodity = MockedCommodity();
commodity.getById().then(data => {
  assert.equal(data.category, _mockItem.category);
  assert.equal(data.id, _mockItem._id);
  assert.equal(data.name, _mockItem.name);
  assert.equal(data.price, _mockItem.price);
  console.log('getById works!');
}).catch(console.error);
commodity.search().then(data => {
  assert.equal(data.length, 1);
  assert.equal(data[0].category, _mockItem.category);
  assert.equal(data[0].id, _mockItem._id);
  assert.equal(data[0].name, _mockItem.name);
  assert.equal(data[0].price, _mockItem.price);
  console.log('search works!');
}).catch(console.error);
```

Do you see the idea? The reusable DB mock can be attached to any behavior. Fantastic!

------------------------------

## Hacking stamps

Each stamp has the property `compose`. It's an object with 10 properties. It's used by stampit in the following order:
* `Stamp.compose.methods` - plain object. Stampit uses it to set new objects' prototype: `Object.create(compose.methods)`.
* `Stamp.compose.properties` - plain object. Stampit uses it to set new objects' state: `_.assign(obj, compose.properties)`.
* `Stamp.compose.deepProperties` - plain object. Stampit deeply merges it into new objects: `_.merge(obj, compose.deepProperties)`.
* `Stamp.compose.initializers` - array of functions. Stampit calls them sequentially: `compose.initializers.forEach(fn => fn.call(obj))`.
* See more in the [stamp specification](https://github.com/stampit-org/stamp-specification).

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git && cd stampit
$ node advanced-examples/hacking.js
```

### Enforced default properties

You can add **non-removable** "default" state by changing `Stamp.compose.methods`.
I.e. you can modify object instances' `.prototype`.
```js
const Stamp = stampit();
Stamp.compose.methods.data = 1; // compose.methods is the prototype for each new object.
const instance = Stamp(); // Creating object, it's prototype is set to compose.methods. It has property 'data'.
console.log(instance.data); // 1
```
Will print `1`. But let's add some state:
```js
const instance2 = Stamp({ data: 2 }); // Creating second object. It'll have property 'data' too.
console.log(instance2.data); // 2
```
Will print `2`. But let's delete this property from the instance.
```js
delete instance2.data; // Deleting 'data' assigned to the instance.
console.log(instance2.data); // 1 <- The .prototype.data is still there.
```
Will print `1`. The `data` was removed from the object instance, but not from its prototype.

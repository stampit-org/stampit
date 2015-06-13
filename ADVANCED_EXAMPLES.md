
## `object.getStamp()`. 2 ways.

> Run the examples below for yourself:
```sh
$ git clone https://github.com/stampit-org/stampit.git
$ node stampit/test/advanced-examples/self-aware.js
```

You can add `.getStamp()` function to each object with ease. 

First, let's assume you have a following stamp:
```js
var User = stampit();
```

### First way
Just compose the following stamp to any other stamp.
```js
var SelfAware1 = stampit.init(function (ctx) {
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
var SelfAware2 = stampit.init(function (ctx) {
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
$ node stampit/test/advanced-examples/cloneable.js
```

This is simple stamp with a single method and a single data property.
```js
var PrependLogger = stampit.methods({
  log: function (data) {
    console.log(this.prefix, data);
  }
}).state({
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
var Cloneable = stampit.init(function (ctx) { // ctx has { instance, stamp, args }
  this.clone = function () { return ctx.stamp(ctx.instance); };
});
```
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
The `logger` and `loggerClone` work exactly the same! Woah! 

### Another way of self cloning

This is how you can implement self cloning different: 
```js
var Cloneable = stampit.init(function (ctx) {
  this.clone = ctx.stamp.bind(null, this);
});
```
Stamp is a regular function, so we simply bound its first argument.

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
  console.log(this);
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
$ node stampit/test/advanced-examples/self-aware.js
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

------------------------------
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
Just compose the following stamp to any other stamps.
```js
var SelfAware1 = stampit.init(function (ctx) {
  this.getStamp = function () { return ctx.stamp; }
});
```
Composing with the `User` stamp from above:
```js
var SelfAwareUser1 = User.compose(SelfAware1);
```
Let's create a user and see:
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
    var stamp = ctx.stamp; // We should reference only one object, otherwise is memory leak risky
    ctx.stamp.fixed.methods.getStamp = function () { return stamp; }
  }
});
```
The `ctx.stamp.fixed` property contains stamp's internal data.
The `fixed.methods` object is used as all object instances' `.prototype`.
Compose it with our `User` from above:
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
Compose it with our `PrependLogger` from above:
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


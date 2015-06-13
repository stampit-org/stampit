------------------------------

## Self cloneable objects

Run the examples below for yourself:
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

### Add cloning ability to the `PrependLogger`

Let's implement a stamp with allows **any** object to be safely cloned: 
```js
var Cloneable = stampit.init(function (ctx) {
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
Compose it with our `PrependLogger` from above:
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
to every object but to the prototype. This will save us a little bit of memory.
```js
var Cloneable = stampit.init(function (ctx) {
  if (!ctx.stamp.fixed.methods.clone) { // check if prototype is already has the clone() method
    var stamp = ctx.stamp;
    ctx.stamp.fixed.methods.clone = function () { return stamp(this) };
  }
});
```
The `ctx.stamp.fixed` property contains stamp's internal data.
The `fixed.methods` object is used as new object instances' `.prototype`.
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

------------------------------


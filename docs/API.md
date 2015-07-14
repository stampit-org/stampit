# Stampit API

## Example

```js
var Logger = stampit({
  methods: {
    log: console.log
  }
});

var DefaultConnectionConfig = stampit().props({
  connectionConfig: require('./config.json').db.connection;
});

var DbConnection = stampit().refs({
  dbConnection: mongoose.connection
})
.init(function () {
  if (!this.dbConnection.readyState) {
    this.connection.open(this.connectionConfig);
    this.log('Opening a DB connection');
  }
})
.methods({
  close() {
    if (this.dbConnection.readyState) {
      this.dbConnection.close();
      this.log('Closing the DB connection');
    }
  }
})
.compose(Logger, DefaultConnectionConfig);

var conn = DbConnection(); // Opens a DB connection
var conn2 = DbConnection({ connection: conn.dbConnection }); // reusing existing
conn.close(); // Closes the conneciton.

// Connect to a different DB.
var localConn = DbConnection({ connectionConfig: 'mongodb://localhost' });
```

**Source: stampit.js**

### stampit()

Return a factory function (called a stamp) that will produce new objects using the
components that are passed in or composed.

 * @param  {Object} [options] Options to build stamp from: `{ methods, refs, init, props }`
 * @param  {Object} [options.methods] A map of method names and bodies for delegation.
 * @param  {Object} [options.refs] A map of property names and values to be mixed into each new object.
 * @param  {Object} [options.init] A closure (function) used to create private data and privileged methods.
 * @param  {Object} [options.props] An object to be deeply cloned into each newly stamped object.
 * @return {Function} factory A factory to produce objects.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the stamp metadata.
 * @return {Function} factory.methods Add methods to the stamp. Chainable.
 * @return {Function} factory.refs Add references to the stamp. Chainable.
 * @return {Function} factory.init Add a closure which called on object instantiation. Chainable.
 * @return {Function} factory.props Add deeply cloned properties to the produced objects. Chainable.
 * @return {Function} factory.compose Add stamp to stamp. Chainable.
 * @return {Function} factory.static Add properties to the factory object. Chainable.


## The stamp object

### stamp.methods()

Take n objects and add them to the methods list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.


### stamp.refs()

Take n objects and add them to the references list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

It has an alias - `stamp.state()`. Deprecated.


### stamp.init([arg1] [,arg2] [,arg3...])

Take n functions, an array of functions, or n objects and add
the functions to the initializers list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

If any of the init() functions return a Promise then the stamp will always be creating Promises 
which resolve to the expected object instance.

It has an alias - `stamp.enclose()`. Deprecated.

Functions passed into `.init()` are called any time an
object is instantiated. That happens when the stamp function
is invoked, or when the `.create()` method is called.

Each function receives the following object as the first argument:
```
{
  instance,
  stamp,
  args
}
```

Examples (ES6).

Make any stamp cloneable.
```js
let Cloneable = stampit().init(({instance, stamp, args}) =>
  instance.clone = () => stamp(instance);
});

let MyStamp = stampit().refs({x: 42}).compose(Cloneable); // composing with the "Cloneable" behavior
MyStamp.create().clone().clone().clone().x === 42; // true
```

Teach any object to return original stamp:
```js
let SelfKnowlegeable = stampit().init(({instance, stamp, args}) =>
  this.originalStamp = stamp;
});

let MyStamp = stampit().refs({x: 42}).compose(SelfKnowlegeable); // composing with the "SelfKnowlegeable" behavior
MyStamp.create().originalStamp === MyStamp; // true
```

### stamp.props()

Take n objects and deep merge them safely to the properties. Creates new stamp.
Note: the merge algorithm will not change any existing `refs` data of a resulting object instance.
* @return {Object} stamp  The new stamp based on the original `this` stamp.


### stamp.compose([arg1] [,arg2] [,arg3...])

Take one or more factories produced from stampit() and
combine them with `this` to produce and return a new factory object.
Combining overrides properties with last-in priority.
 * @return {Function} A new stampit factory composed from arguments.


### stamp.create([properties] [,arg1] [,arg2...])

Alias to `stamp([properties] [,arg1] [,arg2...])`.

Just like calling `stamp()`, `stamp.create()` invokes the stamp
and returns a new object instance. The first argument is an object
containing properties you wish to set on the new objects.
The properties are copied by reference using standard mixin/extend/assign algorithm.

The remaining arguments are passed to all `.init()`
functions. **WARNING** Avoid using two different `.init()`
functions that expect different arguments. `.init()`
functions that take arguments should not be considered safe to
compose with other `.init()` functions that also take
arguments. Taking arguments with an `.init()` function is an
anti-pattern that should be avoided, when possible.


### stamp.static()

Take n objects and add all its properties to the stamp (aka factory object).
* @return {Object} stamp A new stamp.


## Utility methods

### stampit.methods()

Shortcut for `stampit().methods()`

### stampit.refs()

Shortcut for `stampit().refs()` 

### stampit.init()

Shortcut for `stampit().init()`

### stampit.props()

Shortcut for `stampit().props()`

### stampit.compose()

Take two or more stamps produced from stampit() and
combine them to produce a new stamp. Combining overrides
properties with last-in priority.

* `@param {...Function|Function[]} stamp` any number of stamps.
* `@return {Function}` A new stamp composed from arguments.


### stampit.mixin(), .extend(), .mixIn(), .assign()

Aliases to `Object.assign()`. Deprecated.


### stampit.isStamp(obj)

Take an object and return `true` if it's a stamp, `false` otherwise.


### stampit.convertConstructor()

Take an old-fashioned JS constructor and return a stamp  that
you can freely compose with other stamps. It is possible to
use constructors that take arguments. Simply pass the arguments
into the returned stamp after the properties object:
`var myInstance = myStamp(props, arg1, arg2);`

Note that if you use this feature, it is **not safe** to compose
the resulting stamp with other stamps willy-nilly, because if two
different stamps depend on the argument passing feature, the arguments
will probably clash with each other, producing very unexpected results.

 * @param  {Function} Constructor
 * @return {Function} A composable stampit factory (aka stamp).

```js
  // The old constructor / class thing...
  var Constructor = function Constructor() {
    this.thing = 'initialized';
  };
  Constructor.prototype.foo = function foo() { return 'foo'; };

  // The conversion
  var oldskool = stampit.convertConstructor(Constructor);

  // A new stamp to compose with...
  var newskool = stampit({
    methods: {
      bar: function bar() { return 'bar'; }
     // your methods here...
    },
    init: function () {
      this.baz = 'baz';
    }
  });

  // Now you can compose those old constructors just like you could
  // with any other stamp...
  var myThing = stampit.compose(oldskool, newskool);

  var t = myThing();

  t.thing; // 'initialized',

  t.foo(); // 'foo',

  t.bar(); // 'bar'
```

# Examples

## Pass multiple objects into .methods(), .refs(), .init(), props(), .static(), or .compose().

Every fluent method of stampit can receive multiple arguments.
The properties from later arguments in the list will override the same named properties of previously passed in objects. 

```js
  var obj = stampit().methods({
    a: function () { return 'a'; }
  }, {
    b: function () { return 'b'; }
  }).create();
```

Or `.refs()` ...

```js
  var obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();
```


Or `.init()` ...

```js
  var obj = stampit().init(function () {
    console.log(this);
  }, function () {
    console.log(this); // same as above
  }).create();
```


Or `.props()` ...

```js
  var obj = stampit().props({
    name: { first: 'John' }
  }, {
    name: { last: 'Doe' }
  }).create();
```

Or `.static()` ...

```js
  var obj = stampit().static({
    foo: 'foo'
  }, {
    bar: 'bar'
  }).create();
```

Or even `.compose()` ...

```js
  var obj = abstractStamp.compose(concreteStamp, additionalStamp, utilityStamp).create();
```

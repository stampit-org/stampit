# Stampit API

## Example

```js
// Adds .log() method to factory instantiated objects.
const Logger = stampit({
  methods: {
    log: console.log
  }
});

// Assigns the default connection string.
const DefaultConnectionConfig = stampit().props({
  connectionConfig: require('./config.json').db.connection;
});

// The connection object.
const DbConnection = 
  stampit().refs({ // Assigns the mongoose connection object.
    dbConnection: mongoose.connection
  })
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
  })
  .compose(
    Logger, // add logging capability via this.log() 
    DefaultConnectionConfig // add the default this.connectionConfig value
  );

const conn = DbConnection(); // Open a DB connection
const conn2 = DbConnection({ dbConnection: conn.dbConnection }); // reusing existing
conn.close(); // Close the conneciton.

// Connect to a different DB.
const localConn = DbConnection({ connectionConfig: 'mongodb://localhost' });
```


### stampit()

Return a factory function (called a stamp) that will produce new objects using the
components that are passed in or composed.

 * @param  {Object} [options] Options to build stamp from: `{ methods, refs, init, props }`
 * @param  {Object} [options.methods] A map of method names and bodies for delegation.
 * @param  {Object} [options.refs] A map of property names and values to be mixed into each new object.
 * @param  {Object} [options.init] A closure (function) used to create private data and privileged methods.
 * @param  {Object} [options.props] An object to be deeply merged into each newly stamped object.
 * @return {Function} factory A factory to produce objects.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the stamp metadata.
 * @return {Function} factory.methods Add methods to the stamp. Chainable.
 * @return {Function} factory.refs Add references to the stamp. Chainable.
 * @return {Function} factory.init Add a closure which called on object instantiation. Chainable.
 * @return {Function} factory.props Add deeply merged properties to the produced objects. Chainable.
 * @return {Function} factory.compose Add stamp to stamp. Chainable.
 * @return {Function} factory.static Add properties to the factory object. Chainable.

```js
const stamp = stampit({
  methods: {
    amplify(value) {
      return this.factor * value;
    }
  },
  refs: {
    defaultFactor: 1
  },
  init() {
    this.factor = this.factor >= 0 ? this.factor : this.defaultFactor;
  }
});

const objectInstance = stamp({factor: 1.1});
```

## The stamp object

### stamp.methods()

Take n objects and add them to the methods list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

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

### stamp.refs()

Take n objects and add them to the references list of a new stamp. Creates new stamp.
* @return {Object} stamp  The new stamp based on the original `this` stamp.

It has an alias - `stamp.state()`. Deprecated.

```js
const stamp = stampit().refs({
  factor: 1
});

console.log(stamp().factor); // 1
console.log(stamp({factor: 5}).factor); // 5
```

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

#### Examples

Private state.
```js
const stamp = stampit().init(({instance, args}) => {
  const factor = args[0] || 1;
  instance.getFactor = () => factor;
});

console.log(stamp().getFactor()); // 1
console.log(stamp(null, 2.5).getFactor()); // 2.5
```

Make any stamp cloneable.
```js
const Cloneable = stampit().init(({instance, stamp, args}) =>
  instance.clone = () => stamp(instance);
});

const MyStamp = stampit().refs({x: 42}).compose(Cloneable); // composing with the "Cloneable" behavior
MyStamp().clone().clone().clone().x === 42; // true
```

Delayed initialization via returning a Promise.
```js
import fs from 'fs';
import denodeify from 'denodeify';
const readFilePromise = denodeify(fs.readFile);

const PackageDependencies = stampit().init(({instance}) =>
  return readFilePromise(instance.fileName).then((contents) => JSON.parse(contents).dependencies);
});

PackageDependencies({fileName: './package.json'}).then((dependencies) => console.log(dependencies));
```

### stamp.props()

Take n objects and deep merge them safely to the properties. Creates new stamp.
Note: the merge algorithm will not change any existing `refs` data of a resulting object instance.
* @return {Object} stamp  The new stamp based on the original `this` stamp.


```js
const stamp = stampit().props({
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


### stamp.compose([arg1] [,arg2] [,arg3...])

Take one or more factories produced from stampit() and
combine them with `this` to produce and return a new factory object.
Combining overrides properties with last-in priority.
 * @return {Function} A new stampit factory composed from arguments.

```js
const stamp1 = stampit({ methods: { log: console.log } });
const stamp2 = stampit({ refs: { theAnswer: 42 } });

const composedStamp = stamp1.compose(stamp2);
```

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

```js
const stamp = stampit().init(({args}) => { console.log(args); });
stamp.create(null, 42); // 42
stamp(null, 42); // 42
```

### stamp.static()

Take n objects and add all its properties to the stamp (aka factory object).
* @return {Object} stamp A new stamp.

```js
const stamp = stampit().static({
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
stamp = stamp.static({
  foo: 'foo'
});
```

See more useful tips in the [advanced examples](advanced_examples.md#validate-before-a-function-call).

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

Shortcut for `stampit().compose()`

### stampit.mixin(), .extend(), .mixIn(), .assign()

Aliases to `Object.assign()`. Deprecated.


### stampit.isStamp(obj)

Take an object and return `true` if it's a stamp, `false` otherwise.


### stampit.convertConstructor()

Take an old-fashioned JS constructor and return a stamp  that
you can freely compose with other stamps. It is possible to
use constructors that take arguments. Simply pass the arguments
into the returned stamp after the properties object:
`const myInstance = myStamp(props, arg1, arg2);`

Note that if you use this feature, it is **not safe** to compose
the resulting stamp with other stamps willy-nilly, because if two
different stamps depend on the argument passing feature, the arguments
will probably clash with each other, producing very unexpected results.

 * @param  {Function} Constructor
 * @return {Function} A composable stampit factory (aka stamp).

```js
  // The old constructor / class thing...
  const Constructor = function Constructor() {
    this.thing = 'initialized';
  };
  Constructor.prototype.foo = function foo() { return 'foo'; };

  // The conversion
  const oldskool = stampit.convertConstructor(Constructor);

  // A new stamp to compose with...
  const newskool = stampit({
    methods: {
      bar() { return 'bar'; }
     // your methods here...
    },
    init() {
      this.baz = 'baz';
    }
  });

  // Now you can compose those old constructors just like you could
  // with any other stamp...
  const myThing = stampit.compose(oldskool, newskool);

  const t = myThing();

  t.thing; // 'initialized',

  t.foo(); // 'foo',

  t.bar(); // 'bar'
```

## Examples

### Pass multiple objects into .methods(), .refs(), .init(), props(), .static(), or .compose().

Every fluent method of stampit can receive multiple arguments.
The properties from later arguments in the list will override the same named properties of previously passed in objects. 

```js
  const obj = stampit().methods({
    a() { return 'a'; }
  }, {
    b() { return 'b'; }
  }).create();
```

Or `.refs()` ...

```js
  const obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();
```


Or `.init()` ...

```js
  const obj = stampit().init(function () {
    console.log(this);
  }, function () {
    console.log(this); // same as above
  }).create();
```


Or `.props()` ...

```js
  const obj = stampit().props({
    name: { first: 'John' }
  }, {
    name: { last: 'Doe' }
  }).create();
```

Or `.static()` ...

```js
  const obj = stampit().static({
    foo: 'foo'
  }, {
    bar: 'bar'
  }).create();
```

Or even `.compose()` ...

```js
  const obj = abstractStamp.compose(concreteStamp, additionalStamp, utilityStamp).create();
```


## Chaining methods

Chaining stamps *always* creates new stamps.

Chain `.methods()` ...

```js
const myStamp = stampit().methods({
  methodOverride() {
    return false;
  }
}).methods({
  methodOverride() {
    return true;
  }
});
```

And `.refs()` ...

```js
myStamp = myStamp.refs({
  stateOverride: false
}).refs({
  stateOverride: true
});
```

And `.props()` ...

```js
myStamp = myStamp.props({
  name: { first: 'John' }
}).props({
  name: { last: 'Doe' }
});
```

And `.static()` ...

```js
myStamp.static({
  staticOverride: false
}).static({
  staticOverride: true
});
```

And `.init()` ...

```js
myStamp = myStamp.init(function () {
  const secret = 'foo';

  this.getSecret = function () {
    return secret;
  };
}).init({
  foo: function bar() {
    this.a = true;
  }
}, {
  bar: function baz() {
    this.b = true;
  }
});

myStamp.staticOverride; // true

const obj = myStamp();
obj.methodOverride; // true
obj.stateOverride; // true
obj.name.first && obj.name.last; // true
obj.getSecret && obj.a && obj.b; // true
```

And `.compose()`.

```js
const newStamp = baseStamp.compose(myStamp);
```

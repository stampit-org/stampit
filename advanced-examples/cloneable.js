const stampit = require('../src/stampit');

const PrependLogger = stampit.methods({
  log(obj) {
    console.log(this.prefix, obj);
  }
}).state({
  prefix: 'STDOUT: '
});
const originalLogger = PrependLogger();
originalLogger.log('hello');


// -----

const Cloneable1 = stampit.init(({ instance, stamp }) => {
  instance.clone = () => stamp(instance);
});
const CloneablePrependLogger1 = PrependLogger.compose(Cloneable1);
const logger1 = CloneablePrependLogger1({ prefix: 'OUT: ' }); // creating first object
const loggerClone1 = logger1.clone(); // cloning the object.
logger1.log('hello'); // OUT: hello
loggerClone1.log('hello'); // OUT: hello


// -----

const Cloneable2 = stampit.init(({ instance, stamp }) => {
  instance.clone = stamp.bind(null, instance);
});
const CloneablePrependLogger2 = PrependLogger.compose(Cloneable2);
const logger2 = CloneablePrependLogger2({ prefix: 'OUT: ' }); // creating first object
const loggerClone2 = logger2.clone(); // cloning the object.
logger2.log('hello'); // OUT: hello
loggerClone2.log('hello'); // OUT: hello


// -----

const Cloneable3 = stampit.init(({ instance, stamp }) => {
  if (!stamp.fixed.methods.clone) { // Avoid adding the same method to the prototype twice.
    stamp.fixed.methods.clone = function () { return stamp(this); };
  }
});
const CloneablePrependLogger3 = PrependLogger.compose(Cloneable3);
const logger3 = CloneablePrependLogger3({ prefix: 'OUT: ' });  // creating first object
const loggerClone3 = logger3.clone(); // cloning the object.
logger3.log('hello'); // OUT: hello
loggerClone3.log('hello'); // OUT: hello

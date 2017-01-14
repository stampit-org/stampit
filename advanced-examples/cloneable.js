const stampit = require('..');

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
const originalLogger = PrependLogger();
originalLogger.log('hello');


// -----

const Cloneable1 = stampit.init((opts, { instance, stamp }) => {
  instance.clone = () => Object.assign(stamp(), instance);
});
const CloneablePrependLogger1 = PrependLogger.compose(Cloneable1);
const logger1 = CloneablePrependLogger1({ prefix: 'OUT: ' }); // creating first object
const loggerClone1 = logger1.clone(); // cloning the object.
logger1.log('hello'); // OUT: hello
loggerClone1.log('hello'); // OUT: hello


// -----

const Cloneable2 = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {}; // make sure it exists
  stamp.compose.methods.clone = function () { return Object.assign(stamp(), this); };
});
const CloneablePrependLogger3 = PrependLogger.compose(Cloneable2);
const logger3 = CloneablePrependLogger3({ prefix: 'OUT: ' });  // creating first object
const loggerClone3 = logger3.clone(); // cloning the object.
logger3.log('hello'); // OUT: hello
loggerClone3.log('hello'); // OUT: hello

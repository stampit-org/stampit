/* jshint newcap: false */
'use strict';
var stampit = require('../../stampit');

var PrependLogger = stampit.methods({
  log: function (data) {
    console.log(this.prefix, data);
  }
}).state({
  prefix: 'STDOUT: '
});
var originalLogger = PrependLogger();
originalLogger.log('hello');


var Cloneable1 = stampit.init(function (ctx) {
  this.clone = function () { return ctx.stamp(ctx.instance); };
});
var PrependLogger1 = PrependLogger.compose(Cloneable1);
var logger1 = PrependLogger1({ prefix: 'OUT: ' }); // creating first object
var loggerClone1 = logger1.clone(); // cloning the object.
logger1.log('hello'); // OUT: hello
loggerClone1.log('hello'); // OUT: hello


var Cloneable2 = stampit.init(function (ctx) {
  this.clone = ctx.stamp.bind(null, this);
});
var PrependLogger2 = PrependLogger.compose(Cloneable2);
var logger2 = PrependLogger2({ prefix: 'OUT: ' }); // creating first object
var loggerClone2 = logger2.clone(); // cloning the object.
logger2.log('hello'); // OUT: hello
loggerClone2.log('hello'); // OUT: hello


var Cloneable3 = stampit.init(function (ctx) {
  if (!ctx.stamp.fixed.methods.clone) { // check if prototype is already has the clone() method
    var stamp = ctx.stamp;
    ctx.stamp.fixed.methods.clone = function () { return stamp(this); };
  }
});
var PrependLogger3 = PrependLogger.compose(Cloneable3);
var logger3 = PrependLogger3({ prefix: 'OUT: ' });  // creating first object
var loggerClone3 = logger3.clone(); // cloning the object.
logger3.log('hello'); // OUT: hello
loggerClone3.log('hello'); // OUT: hello

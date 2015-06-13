/* jshint newcap: false */
'use strict';
var assert = require('assert');
var stampit = require('../../stampit');
var User = stampit();


var SelfAware1 = stampit.init(function (ctx) {
  this.getStamp = function () { return ctx.stamp; };
});
var SelfAwareUser1 = User.compose(SelfAware1);
var user1 = SelfAwareUser1();
assert.strictEqual(user1.getStamp(), SelfAwareUser1); // All good
console.log('No worries');


var SelfAware2 = stampit.init(function (ctx) {
  if (!ctx.stamp.fixed.methods.getStamp) {
    var stamp = ctx.stamp;
    ctx.stamp.fixed.methods.getStamp = function () { return stamp; };
  }
});
var SelfAwareUser2 = User.compose(SelfAware2);
var user2 = SelfAwareUser2();
assert.strictEqual(user2.getStamp(), SelfAwareUser2); // All good
console.log('No worries');

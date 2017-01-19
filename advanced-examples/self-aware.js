const assert = require('assert');
const stampit = require('..');
const User = stampit();


const SelfAware1 = stampit.init((opts, { instance, stamp }) => {
  instance.getStamp = () => stamp;
});
const SelfAwareUser1 = User.compose(SelfAware1);
const user1 = SelfAwareUser1();
assert.strictEqual(user1.getStamp(), SelfAwareUser1); // All good
console.log('No worries');


// -----

const SelfAware2 = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {}; // make sure it exists
  stamp.compose.methods.getStamp = () => stamp;
});
const SelfAwareUser2 = User.compose(SelfAware2);
const user2 = SelfAwareUser2();
assert.strictEqual(user2.getStamp(), SelfAwareUser2); // All good
console.log('No worries');

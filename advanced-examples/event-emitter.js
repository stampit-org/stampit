const stampit = require('..');


const EventEmitter = require('events').EventEmitter;
const EventEmittable = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {}; // make sure it exists
  Object.setPrototypeOf(stamp.compose.methods, EventEmitter.prototype);
});

const User = stampit.init((opts, {instance}) => {
  if (opts.name) instance.name = opts.name;
})
.props({
  name: { first: "(unnamed)", last: "(unnamed)" }
});
const EmittableUser = User.compose(EventEmittable);

const user = EmittableUser({ name: { first: "John", last: "Doe" } });
user.on('name', console.log); // Does not throw exceptions like "user.on() has no method 'on'"
user.emit('name', user.name); // correctly handled by the object.
// Prints{ first: 'John', last: 'Doe' }

const stampit = require('../src/stampit');


const EventEmitter = require('events').EventEmitter;
const EventEmittable = stampit.convertConstructor(EventEmitter);

const User = stampit.refs({ name: { first: "(unnamed)", last: "(unnamed)" } });
const EmittableUser = User.compose(EventEmittable);

const user = EmittableUser({ name: { first: "John", last: "Doe" } });
user.on('name', console.log); // Does not throw exceptions like "user.on() has no method 'on'"
user.emit('name', user.name); // correctly handled by the object.

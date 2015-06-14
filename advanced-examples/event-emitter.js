/* jshint newcap: false */
'use strict';
var stampit = require('../stampit');


var EventEmitter = require('events').EventEmitter;
var EventEmittable = stampit.convertConstructor(EventEmitter);

var User = stampit.refs({ name: { first: "(unnamed)", last: "(unnamed)" } });
var EmittableUser = User.compose(EventEmittable);

var user = EmittableUser({ name: { first: "John", last: "Doe" } });
user.on('name', console.log); // Does not throw exceptions like "user.on() has no method 'on'"
user.emit('name', user.name); // correctly handled by the object.

// jshint ignore: start
'use strict';
var assert = require('assert');
var stampit = require('../../stampit');

var User = stampit.refs({ entityName: 'user' });


var AsyncInitializable = stampit.refs({
  db: mongo.connection
}).methods({
  getEntity: function(id) { // Gets id and return Promise which resolves into DB entity.
    return Promise.resolve(this.db[this.entityName].getById(id));
  }
}).init(() => {
  // If we return anything from an .init() function it becomes our object instance.
  return this.getEntity(this.id);
});

var AsyncInitializableUser = User.compose(AsyncInitializable);
var userEntity1 = yield AsyncInitializableUser({ id: '42' });

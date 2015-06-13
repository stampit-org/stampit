/* jshint newcap: false */
'use strict';
var _ = require('lodash');
var stampit = require('../../stampit');


var UserWithValidation = stampit.methods({
  authorise: function () {
    return true || false; // dummy implementation
  }
}).init(function () {
  var authorise = this.authorise; // Replacing function.
  this.authorise = function () {
    // Do our validation logic. It can be anything really.
    if (this.user &&
      !_.isEmpty(this.user.name) && !_.isEmpty(this.user.password) &&
      _.isString(this.user.name) && _.isString(this.user.password)) {
      return authorise.apply(this, arguments); // call the original function if all went fine.
    }

    // Validation failed. Do something like throwing error.
    throw new Error('user data is missing')
  }.bind(this);
});
var user = UserWithValidation({user: {name: 'john', password: ''}});
user.authorise();

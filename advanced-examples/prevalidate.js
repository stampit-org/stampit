var _ = require('lodash');
var joi = require('joi'); // object validation module
var stampit = require('../src/stampit');


const User = stampit.methods({
  authorize() {
    // dummy implementation. Don't bother. :)
    return this.authorized = (this.user.name === 'john' && this.user.password === '123');
  }
});

const JoiPrevalidator = stampit
  .static({ // Adding properties (this function) to stamps, not object instances.
    prevalidate(methodName, schema) {
      var prevalidations = this.fixed.refs.prevalidations || {}; // Taking existing validation schemas
      prevalidations[methodName] = schema; // Adding/overriding a validation schema.
      return this.refs({prevalidations}); // Cloning self and (re)assigning a reference.
    }
  })
  .init(function () { // This will be called for each new object instance.
    _.forOwn(this.prevalidations, (value, key) => { // overriding functions
      const actualFunc = this[key];
      this[key] = () => { // Overwrite a real function with our.
        const result = joi.validate(this, value, {allowUnknown: true});
        if (result.error) {
          throw new Error(`Can't call ${key}(), prevalidation failed: ${result.error}`);
        }

        return actualFunc.apply(this, arguments);
      }
    });
  });

const UserWithValidation = User.compose(JoiPrevalidator) // Adds new method prevalidate() to the stamp.
  .prevalidate('authorize', { // Setup a prevalidation rule
    user: {
      name: joi.string().required(),
      password: joi.string().required()
    }
  });

const okUser = UserWithValidation({user: {name: 'john', password: '123'}});
okUser.authorize(); // No error. Validation successful.
console.log('Authorised:', okUser.authorized);

const throwingUser = UserWithValidation({user: {name: 'john', password: ''}});
throwingUser.authorize(); // will throw because password is absent

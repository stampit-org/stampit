const _ = require('lodash');
const joi = require('joi'); // object validation module
const stampit = require('..');


const User = stampit.init((opts, {instance}) => {
  if (opts.user) instance.user = opts.user;
})
.methods({
  authorize() {
    // dummy implementation. Don't bother. :)
    return this.authorized = (this.user.name === 'john' && this.user.password === '123');
  }
});

const JoiPrevalidator = stampit
  .statics({ // Adds properties to stamps, not object instances.
    prevalidate(methodName, schema) {
      this.compose.configuration = this.compose.configuration || {};
      const prevalidations = this.compose.configuration.prevalidations || {}; // Taking existing validation schemas
      prevalidations[methodName] = schema; // Adding/overriding a validation schema.
      return this.conf({prevalidations}); // Cloning self and (re)assigning a reference.
    }
  })
  .init(function (opts, {stamp}) { // This will be called for each new object instance.
    _.forOwn(stamp.compose.configuration.prevalidations, (value, key) => { // overriding functions
      const actualFunc = this[key];
      this[key] = ( ...args ) => { // Overwrite a real function with ours.
        const result = joi.validate(this, value, {allowUnknown: true});
        if (result.error) {
          throw new Error(`Can't call ${key}(), prevalidation failed: ${result.error}`);
        }

        return actualFunc.apply(this, args);
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

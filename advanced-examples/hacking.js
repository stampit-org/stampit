const stampit = require('../stampit');


const Stamp = stampit();
Stamp.fixed.methods.data = 1; // fixed.methods is the prototype for each new object.
const instance = Stamp(); // Creating object, it's prototype is set to fixed.methods. It has property 'data'.
console.log(instance.data); // 1
const instance2 = Stamp({ data: 2 }); // Creating second object. It'll have property 'data' too.
console.log(instance2.data); // 2
delete instance2.data; // Deleting 'data' assigned to the instance.
console.log(instance2.data); // 1 <- The .prototype.data is still there.


// -----

const UndeletableDefaults = stampit.static({
  forceDefaults(defaults) { //creating new function in the stamp
    const defaultRefs = this.fixed.static.defaultRefs || {}; // Taking existing defaults
    stampit.mixin(defaultRefs, defaults); // add new defaults to it.
    const newStamp = this.static({defaultRefs}); // Cloning self and (re)assigning static references.
    stampit.mixin(newStamp.fixed.methods, defaults); // add new data to the prototype
    return newStamp;
  }
});

const DefaultUserCredentials = UndeletableDefaults.forceDefaults({ user: { name: "guest", password: "guest" } });
const DbConnection = stampit(); // whatever it is...
const DbConnectionWithDefaults = DbConnection.compose(DefaultUserCredentials);

const connectionWithoutCredentials = DbConnectionWithDefaults();
console.log('No credentials were given: ', connectionWithoutCredentials.user);

const connectionWithCredentials = DbConnectionWithDefaults({ user: { name: "admin", password: "123" } });
console.log('Credentials were given: ', connectionWithCredentials.user);

delete connectionWithCredentials.user;
console.log('Reusing the default credentials after deleting them: ', connectionWithCredentials.user);

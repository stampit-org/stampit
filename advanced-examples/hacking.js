const stampit = require('../src/stampit');


const Stamp = stampit();
Stamp.fixed.methods.data = 1; // fixed.methods is the prototype for each new object.
const instance = Stamp(); // Creating object, it's prototype is set to fixed.methods. It has property 'data'.
console.log(instance.data); // 1
const instance2 = Stamp({ data: 2 }); // Creating second object. It'll have property 'data' too.
console.log(instance2.data); // 2
delete instance2.data; // Deleting 'data' assigned to the instance.
console.log(instance2.data); // 1 <- The .prototype.data is still there.


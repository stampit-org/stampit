const stampit = require('../src/stampit');

const User = stampit.refs({ entityName: 'user' });

const AsyncInitializable = stampit.refs({
  db: { user: { getById() { return Promise.resolve({ name: { first: 'John', last: 'Snow' }}) } } } // mocking a DB
}).methods({
  getEntity(id) { // Gets id and return Promise which resolves into DB entity.
    return Promise.resolve(this.db[this.entityName].getById(id));
  }
}).init(function () {
  // If we return anything from an .init() function it becomes our object instance.
  return this.getEntity(this.id);
});

const AsyncInitializableUser = User.compose(AsyncInitializable); // The stamp produces promises now.

const userEntity = AsyncInitializableUser({ id: '42' }).then(console.log);

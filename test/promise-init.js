import stampit from '../src/stampit';
import test from 'blue-tape';

// Promises in init

test('Promises init support', (t) => {
  const Connect = stampit.init(function() {
    return new Promise((resolve) => {
      this.dbConnection = this.connectionString;
      resolve();
    });
  });
  const Read = stampit.init(function() {
    this.readingDone = true;
  });
  const Print = stampit.init(function() {
    t.equal(this.dbConnection, 'conn str', 'first promised init() called with "this" bound to the instance');
    t.ok(this.readingDone, 'second non-promised init() called');
  });

  const promisedStamp = stampit().compose(Connect, Read, Print);

  return promisedStamp({ connectionString: 'conn str' })
    .then(instance => {
      t.ok(instance, 'instance got finally reolved in promise');
      t.equal(instance.connectionString, 'conn str', 'instance is the one created by stampit');
    });
});

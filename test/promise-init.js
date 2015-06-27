import stampit from '../src/stampit';
import test from 'blue-tape';

// Promises in init

test('init-as-promised - resolves to the stamped object', (t) => {
  const promisedStamp = stampit.init(function() {
    return new Promise((resolve) => resolve());
  });

  return promisedStamp({theObject: true})
    .then(instance => {
      t.ok(instance, 'should resolve to object instance');
      t.ok(instance.theObject, 'instance is the one created by stampit');
    });
});

test('init-as-promised - sync-first init propagated to the following promise `this`', (t) => {
  const promisedStamp = stampit
    .init(function() {
      this.newObject = true;
    })
    .init(function() {
      t.ok(this.newObject, 'previous sync should apply before promises take over');
      return new Promise((resolve) => resolve());
    });

  return promisedStamp();
});

test('init-as-promised - promise-first should receive `this` bound to stamped instance', (t) => {
  const promisedStamp = stampit
    .init(function() {
      return new Promise((resolve) => {
        this.newObject = true;
        resolve();
      });
    })
    .init(function() {
      t.ok(this.newObject, 'previous sync should apply before promises take over');
    });

  return promisedStamp();
});

test('init-as-promised - sync-first init returned object resolved at the end', (t) => {
  const promisedStamp = stampit
    .init(function() {
      this.newObject = true;
    })
    .init(function() {
      return new Promise((resolve) => resolve());
    });

  return promisedStamp()
    .then(instance => {
      t.ok(instance, 'should resolve to object instance');
      t.ok(instance.newObject, 'instance is the one created by stampit');
    });
});

test('init-as-promised - promise-first returned object resolved at the end', (t) => {
  const promisedStamp = stampit
    .init(function() {
      return new Promise((resolve) => {
        this.newObject = true;
        resolve();
      });
    })
    .init(function() {});

  return promisedStamp()
    .then(instance => {
      t.ok(instance, 'should resolve to object instance');
      t.ok(instance.newObject, 'instance is the one created by stampit');
    });
});

test('init-as-promised - sync-async-sync `this` is propagated across', (t) => {
  const promisedStamp = stampit
    .init(function() {
      t.ok(this.mainRef, '`this` should be propagated');
      this.firstSyncInit = true;
    })
    .init(function() {
      return new Promise((resolve) => {
        t.ok(this.mainRef, '`this` should be propagated');
        this.asyncInit = true;
        resolve();
      });
    })
    .init(function() {
      t.ok(this.mainRef, '`this` should be propagated');
      this.secondSyncInit = true;
    });

  return promisedStamp({ mainRef: true })
    .then(instance => {
      t.ok(instance, 'should resolve to object instance');
      t.ok(instance.firstSyncInit && instance.asyncInit && instance.secondSyncInit,
        'instance is the one created by stampit');
    });
});

test('init-as-promised - async-sync-async `this` is propagated across', (t) => {
  const promisedStamp = stampit
    .init(function() {
      return new Promise((resolve) => {
        t.ok(this.mainRef, '`this` should be propagated');
        this.firstAsyncInit = true;
        resolve();
      });
    })
    .init(function() {
      t.ok(this.mainRef, '`this` should be propagated');
      this.syncInit = true;
    })
    .init(function() {
      return new Promise((resolve) => {
        t.ok(this.mainRef, '`this` should be propagated');
        this.secondAsyncInit = true;
        resolve();
      });
    });

  return promisedStamp({ mainRef: true })
    .then(instance => {
      t.ok(instance, 'should resolve to object instance');
      t.ok(instance.firstAsyncInit && instance.syncInit && instance.secondAsyncInit,
        'instance is the one created by stampit');
    });
});

test('init-as-promised - sync-async-sync returned objects are propagated as `this`', (t) => {
  const promisedStamp = stampit
    .init(function() {
      t.ok(this.startRef, '`this` should be propagated');
      return { firstRef: true };
    })
    .init(function() {
      return new Promise((resolve) => {
        t.notOk(this.startRef, '`this` should be replaced');
        t.ok(this.firstRef, 'previous returned instance should be propagated as `this`');
        resolve({ secondRef: true });
      });
    })
    .init(function() {
      t.notOk(this.startRef, '`this` should be replaced');
      t.notOk(this.firstRef, '`this` should be replaced');
      t.ok(this.secondRef, 'previous returned instance should be propagated as `this`');
      return { thirdRef: true };
    });

  return promisedStamp({ startRef: true })
    .then(instance => {
      t.notOk(instance.startRef, '`this` should be replaced');
      t.notOk(instance.firstRef, '`this` should be replaced');
      t.notOk(instance.secondRef, '`this` should be replaced');
      t.ok(instance.thirdRef, 'previous returned instance should be propagated as `this`');
    });
});

test('init-as-promised - async-sync-async returned objects are propagated as `this`', (t) => {
  const promisedStamp = stampit
    .init(function() {
      return new Promise((resolve) => {
        t.ok(this.startRef, '`this` should be propagated');
        resolve({ firstRef: true });
      });
    })
    .init(function() {
      t.notOk(this.startRef, '`this` should be replaced');
      t.ok(this.firstRef, 'previous returned instance should be propagated as `this`');
      return { secondRef: true };
    })
    .init(function() {
      return new Promise((resolve) => {
        t.notOk(this.startRef, '`this` should be replaced');
        t.notOk(this.firstRef, '`this` should be replaced');
        t.ok(this.secondRef, 'previous returned instance should be propagated as `this`');
        resolve({ thirdRef: true });
      });
    });

  return promisedStamp({ startRef: true })
    .then(instance => {
      t.notOk(instance.startRef, '`this` should be replaced');
      t.notOk(instance.firstRef, '`this` should be replaced');
      t.notOk(instance.secondRef, '`this` should be replaced');
      t.ok(instance.thirdRef, 'previous returned instance should be propagated as `this`');
    });
});

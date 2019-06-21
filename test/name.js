const test = require('tape');
const stampit = require('../src/stampit');

try {
  const f = Object.defineProperties(
    () => {},
    { name: { value: 'test' } }
  );

  if (f.name === 'test') {
    // Here we are sure that the environment supports function name change (ES6)

    test('name metadata can be set', (t) => {
      const stamp = stampit({
        name: 'MyFactory'
      });

      t.equal(stamp.name, 'MyFactory',
        'Should produce stamp with non-default name');

      t.end();
    });

    test('name metadata is inherited', (t) => {
      const stamp = stampit({
        name: 'MyFactory'
      });
      const derived = stamp.compose({ staticPropertyDescriptors: { value: { x: 'whatever' } } });

      t.equal(derived.name, 'MyFactory',
        'Should inherit name from previous stamp');
      t.equal(derived.compose.staticPropertyDescriptors.value.x, 'whatever',
        'Should not loose other data');

      t.end();
    });

    test('name metadata can be overwritten', (t) => {
      const stamp = stampit({
        name: 'MyFactory'
      });
      const derived = stamp.compose({ name: 'SecondOne' });

      t.equal(derived.name, 'SecondOne',
        'Should overwrite previous stamp name');

      t.end();
    });
  }
} catch (e) {
  // skip these tests in this environment
}

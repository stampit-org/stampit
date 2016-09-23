import test from 'tape';
import stampit from '../src/stampit';

// Basics

test('.create()', (t) => {
  const stamp = stampit({
    methods: {
      foo() { return 'foo'; }
    }
  });

  t.ok(stamp.create);
  t.equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');

  t.end();
});

test('.create(options)', (t) => {
  const stamp = stampit.init((options) => {
    t.deepEqual(options, {foo: 'bar'},
      'Should pass options object to initializer.');
    t.end();
  });
  t.ok(stamp.create);
  stamp.create({foo: 'bar'});
});

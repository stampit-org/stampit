import stampit from '../src/stampit';
import test from 'tape';

// Basics

test('.create()', (t) => {
  const stamp = stampit({
    methods: {
      foo() { return 'foo'; }
    }
  });

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
  stamp.create({foo: 'bar'});
});

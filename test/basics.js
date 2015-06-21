import stampit from '../src/stampit';
import test from 'tape';

// Basics

test('.create()', (t) => {
  const stamp = stampit({ methods: {
    foo() { return 'foo'; }
  }});

  t.equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');

  t.end();
});

test('.create(properties)', (t) => {
  let stamp = stampit({ refs: { foo: 'bar' } });
  const obj = stamp.create({ foo: 'foo' });

  t.equal(obj.foo, 'foo',
    'should override defaults.');

  t.end();
});

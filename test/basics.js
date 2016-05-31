import stampit from '../src/stampit';
import { test } from 'ava';
// Basics

test('.create()', (t) => {
  const stamp = stampit({ methods: {
    foo() { return 'foo'; }
  }});

  t.is(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');
});

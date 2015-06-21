import stampit from '../src/stampit';
import test from 'tape';

// extend, mixIn, mixin, assign

test('stampit.mixin aliases', (t) => {
  t.ok(stampit.mixin);
  t.equal(stampit.mixin, stampit.mixIn);
  t.equal(stampit.mixin, stampit.extend);
  t.equal(stampit.mixin, stampit.assign);

  t.end();
});

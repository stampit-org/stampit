import stampit from '../src/stampit';
import test from 'tape';

// .state alias

test('stampit().fixed.state is same as refs', (t) => {
  const stamp = stampit({ refs: { s: 1 } });

  t.equal(stamp.fixed.refs, stamp.fixed.state);

  t.end();
});

test('stampit().state().fixed.state is same as refs().fixed.refs', (t) => {
  const stamp = stampit({ refs: { s: 1 } }).state({ refs: { s2: 2 } });

  t.equal(stamp.fixed.refs, stamp.fixed.state);
  t.equal(stamp.fixed.refs.s, stamp.fixed.state.s);
  t.equal(stamp.fixed.refs.s2, stamp.fixed.state.s2);

  t.end();
});

test('stampit.compose().fixed.state is same as refs', (t) => {
  const stamp = stampit({ refs: { s: 1 } }).compose(stampit({ refs: { s2: 2 } }));

  t.equal(stamp.fixed.refs, stamp.fixed.state);

  t.end();
});

test('stampit.convertConstructor().fixed.state is same as refs', (t) => {
  function F() {}
  const stamp = stampit.convertConstructor(F);

  t.equal(stamp.fixed.refs, stamp.fixed.state);

  t.end();
});

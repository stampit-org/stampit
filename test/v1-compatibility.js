import stampit from '../src/stampit';
import test from 'tape';

// Stampit v1 compatibility

const v1stamp = {
  fixed: {
    methods: {},
    state: {s: 1},
    enclose: []
  }
};

test('stampit.compose(stamp1, stamp2) is v1 compatible', (t) => {
  const composed1 = stampit.compose(stampit(), v1stamp);
  const composed2 = stampit.compose(v1stamp, stampit());

  t.equal(composed1.fixed.state.s, 1);
  t.equal(composed2.fixed.state.s, 1);

  t.end();
});

test('stampit().compose(stamp) is v1 compatible', (t) => {
  const composed = stampit().compose(v1stamp);

  t.equal(composed.fixed.state.s, 1);

  t.end();
});

test('stampit.isStamp() with legacy stamps', (t) => {
  const emptyStamp = stampit();
  delete emptyStamp.fixed.refs;
  const refsOnlyStamp = stampit().refs({a: 'b'});
  delete refsOnlyStamp.fixed.refs;
  const methodsOnlyStamp = stampit({
    method() {}
  });
  delete methodsOnlyStamp.fixed.refs;
  const closureOnlyStamp = stampit().enclose(() => {});
  delete closureOnlyStamp.fixed.refs;

  t.ok(stampit.isStamp(emptyStamp), 'Empty legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(refsOnlyStamp), 'Refs only legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(methodsOnlyStamp), 'Methods only legacy stamp should be seen as stamp.');
  t.ok(stampit.isStamp(closureOnlyStamp), 'Closure only legacy stamp should be seen as stamp.');

  t.end();
});

test('stamp.init() with legacy stamps', (t) => {
  try {
    const stamp = stampit().enclose(function() {
      this.called = true;
    });
    delete stamp.fixed.init;

    const instance1 = stampit().compose(stamp).create();
    const instance2 = stamp.compose(stampit()).create();

    t.ok(instance1.called, 'New stamp should compose enclosures with legacy.');
    t.ok(instance2.called, 'Legacy stamp should compose enclosures with new.');
  } catch (e) {
    t.fail(e.stack);
  }
  t.end();
});

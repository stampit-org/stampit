import test from 'tape';
import stampit from '../src/stampit';

// Basics statics

test('stampit().statics()', (t) => {
  const stamp1 = stampit()
    .statics({
      foo() {
        return 42;
      },
      bar: 'space'
    });

  t.ok(stamp1.foo, 'Should add statics props to factory.');
  t.equal(stamp1.foo(), 42, 'Should set proper reference.');
  t.equal(stamp1.bar, 'space', 'Should set proper reference.');

  t.end();
});

test('stampit({statics})', (t) => {
  const stamp1 = stampit({
    statics: {
      foo: 42
    }
  });

  t.equal(stamp1.foo, 42, 'Should accept statics in options.');

  t.end();
});

test('stampit().statics() last override', (t) => {
  const stamp1 = stampit()
    .statics({
      foo() {
        return 'override';
      }
    });

  const stamp2 = stampit()
    .statics({
      foo() {}
    }).compose(stamp1);

  t.equal(stamp2.foo(), 'override', 'Should override props during composition.');

  t.end();
});

test('stampit().statics(arg1, arg2)', (t) => {
  const stamp1 = stampit().statics(
    {
      foo1() {}
    },
    {
      foo2() {}
    }
  );

  t.ok(stamp1.foo1, 'Should accept multiple args.');
  t.ok(stamp1.foo2, 'Should accept multiple args.');

  t.end();
});

test('stampit.statics(arg1, arg2)', (t) => {
  const stamp1 = stampit.statics(
    {
      foo1() {}
    },
    {
      foo2() {}
    }
  );

  t.ok(stamp1.foo1, 'Should accept multiple args.');
  t.ok(stamp1.foo2, 'Should accept multiple args.');

  t.end();
});

test('stampit({statics}).statics()', (t) => {
  const stamp1 = stampit({
    statics: {
      foo1: 'foo1 value'
    }
  })
    .statics({
      foo2() {
        return 'foo2 value';
      }
    });

  t.equal(stamp1.foo1, 'foo1 value', 'Should have statics from options.');
  t.equal(stamp1.foo2(), 'foo2 value', 'Should have statics form chain method.');

  t.end();
});

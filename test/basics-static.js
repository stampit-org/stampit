import stampit from '../src/stampit';
import test from 'tape';

// Basics static

test('stampit().static()', (t) => {
  const stamp1 = stampit()
    .static({
      foo() {
        return 42;
      },
      bar: 'space'
    });

  t.ok(stamp1.foo, 'Should add static props to factory.');
  t.equal(stamp1.foo(), 42, 'Should set proper reference.');
  t.equal(stamp1.bar, 'space', 'Should set proper reference.');

  t.end();
});

test('stampit({static})', (t) => {
  const stamp1 = stampit({
    static: {
      foo: 42
    }
  });

  t.equal(stamp1.foo, 42, 'Should accept static in options.');

  t.end();
});

test('stampit().static() last override', (t) => {
  const stamp1 = stampit()
    .static({
      foo() {
        return 'override';
      }
    });

  const stamp2 = stampit()
    .static({
      foo() {}
    }).compose(stamp1);

  t.equal(stamp2.foo(), 'override', 'Should override props during composition.');

  t.end();
});

test('stampit().static(arg1, arg2)', (t) => {
  const stamp1 = stampit().static(
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

test('stampit.static(arg1, arg2)', (t) => {
  const stamp1 = stampit.static(
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

test('stampit({static}).static()', (t) => {
  const stamp1 = stampit({
    static: {
      foo1: 'foo1 value'
    }
  })
    .static({
      foo2() {
        return 'foo2 value';
      }
    });

  t.equal(stamp1.foo1, 'foo1 value', 'Should have static from options.');
  t.equal(stamp1.foo2(), 'foo2 value', 'Should have static form chain method.');

  t.end();
});

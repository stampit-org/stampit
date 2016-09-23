import test from 'tape';
import stampit from '../src/stampit';
import isStamp from '../src/isStamp';

// isStamp

test('isStamp() with stamps', (t) => {
  const emptyStamp = stampit();
  const refsOnlyStamp = stampit().refs({a: 'b'});
  const methodsOnlyStamp = stampit({
    methods: {
      method() {}
    }
  });
  const closureOnlyStamp = stampit().init(() => {});

  t.ok(isStamp(emptyStamp), 'Empty stamp should be seen as stamp.');
  t.ok(isStamp(refsOnlyStamp), 'Refs only stamp should be seen as stamp.');
  t.ok(isStamp(methodsOnlyStamp), 'Methods only stamp should be seen as stamp.');
  t.ok(isStamp(closureOnlyStamp), 'Closure only stamp should be seen as stamp.');

  t.end();
});

test('isStamp() with non stamps', (t) => {
  const obj1 = undefined;
  const obj2 = {refs: {}, methods: {}, init: {}, compose: {}, props: {}};
  const obj3 = function () {
    this.init = this;
  };
  const obj4 = function () {
    this.compose = () => {};
  };

  t.ok(!isStamp(obj1), 'Should not be seen as stamp.');
  t.ok(!isStamp(obj2), 'Should not be seen as stamp.');
  t.ok(!isStamp(obj3), 'Should not be seen as stamp.');
  t.ok(!isStamp(obj4), 'Should not be seen as stamp.');

  t.end();
});

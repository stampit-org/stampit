import stampit from '../src/stampit';
import { test } from 'ava';
// isStamp

test('stampit.isStamp() with stamps', (t) => {
  const emptyStamp = stampit();
  const refsOnlyStamp = stampit().refs({ a: 'b' });
  const methodsOnlyStamp = stampit({ methods: {
    method() {}
  }});
  const closureOnlyStamp = stampit().init(() => {});

  t.truthy(stampit.isStamp(emptyStamp), 'Empty stamp should be seen as stamp.');
  t.truthy(stampit.isStamp(refsOnlyStamp), 'Refs only stamp should be seen as stamp.');
  t.truthy(stampit.isStamp(methodsOnlyStamp), 'Methods only stamp should be seen as stamp.');
  t.truthy(stampit.isStamp(closureOnlyStamp), 'Closure only stamp should be seen as stamp.');
});

test('stampit.isStamp() with non stamps', (t) => {
  const obj1 = undefined;
  const obj2 = { refs: {}, methods: {}, init: {}, compose: {}, props: {} };
  const obj3 = function() {
    this.init = this;
  };
  const obj4 = function() {
    this.compose = () => {};
  };

  t.truthy(!stampit.isStamp(obj1) && !stampit.isStamp(obj2) && !stampit.isStamp(obj3) && !stampit.isStamp(obj4),
    'Should not be seen as stamp.');
});

import stampit from '../src/stampit';
import { test } from 'ava';
// Basics refs

test('stampit({ refs })', (t) => {
  const obj = stampit({ refs: { foo: { bar: 'bar' } } }).create();

  t.is(obj.foo.bar, 'bar',
    'Should set default refs.');
});

test('stampit().refs()', (t) => {
  const obj = stampit().refs({
    foo: { bar: 'bar' },
    refsOverride: false,
    func1() {}
  }).refs({
    bar: 'bar',
    refsOverride: true,
    func2() {}
  }).create();

  t.is(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.is(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.truthy(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.truthy(obj.func1,
    'Should mix functions.');
  t.truthy(obj.func2,
    'Should mix functions.');
});

test('stampit({ refs }).refs()', (t) => {
  const obj = stampit({ refs: {
    foo: { bar: 'bar' },
    refsOverride: false,
    func1() {}
  }}).refs({
    bar: 'bar',
    refsOverride: true,
    func2() {}
  }).create();

  t.is(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.is(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.truthy(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.truthy(obj.func1,
    'Should mix functions.');
  t.truthy(obj.func2,
    'Should mix functions.');
});

test('stampit().refs(a, b)', (t) => {
  const obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.truthy(obj.a && obj.b,
    'Should mixIn objects when multiple properties are passed.');
});

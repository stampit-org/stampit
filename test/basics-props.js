import stampit from '../src/stampit';
import { test } from 'ava';
// Basics Props

test('stampit({ props })', (t) => {
  const obj = stampit({ props: { foo: { bar: 'bar' } } }).create();

  t.is(obj.foo.bar, 'bar',
    'Should set default props.');
});

test('stampit().props()', (t) => {
  const obj = stampit().props({
    foo: { bar: 'bar' },
    propsOverride: false,
    func1() {}
  }).props({
    bar: 'bar',
    propsOverride: true,
    func2() {}
  }).create();

  t.is(obj.foo.bar, 'bar',
    'Should set default props.');
  t.is(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.truthy(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.truthy(obj.func1,
    'Should mix functions.');
  t.truthy(obj.func2,
    'Should mix functions.');
});

test('stampit({ props }).props()', (t) => {
  const obj = stampit({ props: {
    foo: { bar: 'bar' },
    propsOverride: false,
    func1() {}
  }}).props({
    bar: 'bar',
    propsOverride: true,
    func2() {}
  }).create();

  t.is(obj.foo.bar, 'bar',
    'Should set default props.');
  t.is(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.truthy(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.truthy(obj.func1,
    'Should mix functions.');
  t.truthy(obj.func2,
    'Should mix functions.');
});

test('stampit().props(a, b)', (t) => {
  const obj = stampit().props({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.truthy(obj.a && obj.b,
    'Should mixIn objects when multiple objects are passed.');
});

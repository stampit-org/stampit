import test from 'tape';
import stampit from '../src/stampit';

// Basics Props

test('stampit({ props })', (t) => {
  const obj = stampit({props: {foo: {bar: 'bar'}}}).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');

  t.end();
});

test('stampit().props()', (t) => {
  const obj = stampit().props({
    foo: {bar: 'bar'},
    propsOverride: false,
    func1() {}
  }).props({
    bar: 'bar',
    propsOverride: true,
    func2() {}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.ok(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit({ props }).props()', (t) => {
  const obj = stampit({
    props: {
      foo: {bar: 'bar'},
      propsOverride: false,
      func1() {}
    }
  }).props({
    bar: 'bar',
    propsOverride: true,
    func2() {}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.ok(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit().props(a, b)', (t) => {
  const obj = stampit().props({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.ok(obj.a && obj.b,
    'Should mixIn objects when multiple objects are passed.');

  t.end();
});

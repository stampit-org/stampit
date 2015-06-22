import stampit from '../src/stampit';
import test from 'tape';

// Basics refs

test('stampit({ refs })', (t) => {
  const obj = stampit({ refs: { foo: { bar: 'bar' } } }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');

  t.end();
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

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.ok(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
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

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.ok(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit().refs(a, b)', (t) => {
  const obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.ok(obj.a && obj.b,
    'Should mixIn objects when multiple properties are passed.');

  t.end();
});

import test from 'tape';
import stampit from '../src/stampit';

// Basics Enclose

test('stampit({ init })', (t) => {
  const obj = stampit({
    init() {
      const secret = 'foo';
      this.getSecret = () => { return secret; };
    }
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');

  t.end();
});

test('stampit().init()', (t) => {
  const obj = stampit().init(function () {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  }).init(function () {
    this.a = 'a';
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a,
    'Should allow chaining.');

  t.end();
});

test('stampit({ init }).init()', (t) => {
  const obj = stampit({
    init() {
      const secret = 'foo';
      this.getSecret = () => { return secret; };
    }
  }).init(function () {
    this.a = 'a';
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a,
    'Should allow chaining.');

  t.end();
});

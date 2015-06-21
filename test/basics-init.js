import stampit from '../src/stampit';
import test from 'tape';

// Basics Enclose

test('stampit({ init })', (t) => {
  const obj = stampit({ init() {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  }}).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');

  t.end();
});

test('stampit().init()', (t) => {
  const obj = stampit().init(function() {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  }).init(function() {
    this.a = 'a';
  }).init({
    bar() { this.b = 'b'; }
  }, {
    baz() { this.c = 'c'; }
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');

  t.end();
});

test('stampit({ init }).init()', (t) => {
  const obj = stampit({ init() {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  }}).init(function() {
    this.a = 'a';
  }).init({
    bar() { this.b = 'b'; }
  }, {
    baz() { this.c = 'c'; }
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');

  t.end();
});

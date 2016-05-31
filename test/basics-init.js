import stampit from '../src/stampit';
import { test } from 'ava';
// Basics Enclose

test('stampit({ init })', (t) => {
  const obj = stampit({ init() {
    const secret = 'foo';
    this.getSecret = () => { return secret; };
  }}).create();

  t.is(obj.getSecret(), 'foo',
    'Should set closure.');
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

  t.is(obj.getSecret(), 'foo',
    'Should set closure.');
  t.truthy(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');
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

  t.is(obj.getSecret(), 'foo',
    'Should set closure.');
  t.truthy(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');
});

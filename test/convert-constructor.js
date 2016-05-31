import stampit from '../src/stampit';
import { test } from 'ava';
// Oldskool

test.skip('stampit.convertConstructor()', (t) => {
  const Base = function() { this.base = 'base'; };
  Base.prototype.baseFunc = () => { return 'baseFunc'; };

  const Constructor = function Constructor() { this.thing = 'initialized'; };
  Constructor.staticFunc = () => {};
  Constructor.staticProp = 'static';
  Constructor.prototype = new Base();
  Constructor.prototype.foo = () => { return 'foo'; };

  const oldskool = stampit.convertConstructor(Constructor);
  const obj = oldskool();

  t.is(obj.thing, 'initialized',
    'Constructor should execute.');

  t.is(oldskool.staticFunc, Constructor.staticFunc,
    'Non prototype functions should be mixed to stamp.');

  t.is(oldskool.staticProp, 'static',
    'Non prototype properties should be mixed to stamp.');

  t.is(obj.foo && obj.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.is(obj.base, 'base',
    'Prototype property should be mixed in.');

  t.is(obj.baseFunc && obj.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');
});

test.skip('stampit.convertConstructor() composed', (t) => {
  // The old constructor / class thing...
  const BaseOfBase = function() { this.baseOfBase = 'baseOfBase'; };
  BaseOfBase.prototype.baseOfBaseFunc = () => { return 'baseOfBaseFunc'; };

  const Base = function() { this.base = 'base'; };
  Base.prototype = new BaseOfBase();
  Base.prototype.baseFunc = () => { return 'baseFunc'; };

  const Constructor = function Constructor() {
    this.thing = 'initialized';
  };
  Constructor.prototype = new Base();
  Constructor.prototype.foo = () => { return 'foo'; };
  Constructor.staticFunc = () => {};
  Constructor.staticProp = 'static';

  // The conversion
  const oldskool = stampit.convertConstructor(Constructor);

  // A new stamp to compose with...
  const newskool = stampit().methods({
    bar() { return 'bar'; }
    // your methods here...
  }).init(function() {
    this.baz = 'baz';
  });

  // Now you can compose those old constructors just like you could
  // with any other factory...
  const myThing = stampit.compose(oldskool, newskool);
  const myThing2 = stampit.compose(newskool, oldskool);

  const thing = myThing();
  const u = myThing2();

  t.is(thing.thing, 'initialized',
    'Constructor should execute.');

  t.is(thing.foo && thing.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.is(thing.base, 'base',
    'Prototype property should be mixed in.');

  t.is(thing.baseFunc && thing.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.is(thing.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  t.is(thing.baseOfBaseFunc && thing.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  t.is(thing.bar && thing.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  t.is(thing.baz, 'baz',
    'Should be able to add new methods with .compose()');

  t.is(u.thing, 'initialized',
    'Constructor should execute.');

  t.is(u.foo && u.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.is(u.base, 'base',
    'Prototype property should be mixed in.');

  t.is(u.baseFunc && u.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.is(u.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  t.is(u.baseOfBaseFunc && u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  t.is(u.bar && u.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  t.is(u.baz, 'baz',
    'Should be able to add new methods with .compose()');

  t.is(u.baseOfBaseFunc && u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype chain function should be mixed in.');

  t.is(myThing.staticFunc, Constructor.staticFunc,
    'Non prototype functions should be mixed to stamp.');

  t.is(myThing.staticProp, 'static',
    'Non prototype properties should be mixed to stamp.');

  t.is(myThing2.staticFunc, Constructor.staticFunc,
    'Non prototype functions should be mixed to stamp.');

  t.is(myThing2.staticProp, 'static',
    'Non prototype properties should be mixed to stamp.');
});

import test from 'tape';
import stampit from '../src/stampit';

// Oldskool

test.skip('stampit.convertConstructor()', (t) => {
  const Base = function () { this.base = 'base'; };
  Base.prototype.baseFunc = () => { return 'baseFunc'; };

  const Constructor = function Constructor() { this.thing = 'initialized'; };
  Constructor.staticFunc = () => {};
  Constructor.staticProp = 'static';
  Constructor.prototype = new Base();
  Constructor.prototype.foo = () => { return 'foo'; };

  const oldskool = stampit.convertConstructor(Constructor);
  const obj = oldskool();

  t.equal(obj.thing, 'initialized',
    'Constructor should execute.');

  t.equal(oldskool.staticFunc, Constructor.staticFunc,
    'Non prototype functions should be mixed to stamp.');

  t.equal(oldskool.staticProp, 'static',
    'Non prototype properties should be mixed to stamp.');

  t.equal(obj.foo && obj.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.equal(obj.base, 'base',
    'Prototype property should be mixed in.');

  t.equal(obj.baseFunc && obj.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.end();
});

test.skip('stampit.convertConstructor() composed', (t) => {
  // The old constructor / class thing...
  const BaseOfBase = function () { this.baseOfBase = 'baseOfBase'; };
  BaseOfBase.prototype.baseOfBaseFunc = () => { return 'baseOfBaseFunc'; };

  const Base = function () { this.base = 'base'; };
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
  }).init(function () {
    this.baz = 'baz';
  });

  // Now you can compose those old constructors just like you could
  // with any other factory...
  const myThing = stampit.compose(oldskool, newskool);
  const myThing2 = stampit.compose(newskool, oldskool);

  const thing = myThing();
  const u = myThing2();

  t.equal(thing.thing, 'initialized',
    'Constructor should execute.');

  t.equal(thing.foo && thing.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.equal(thing.base, 'base',
    'Prototype property should be mixed in.');

  t.equal(thing.baseFunc && thing.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.equal(thing.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  t.equal(thing.baseOfBaseFunc && thing.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  t.equal(thing.bar && thing.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  t.equal(thing.baz, 'baz',
    'Should be able to add new methods with .compose()');

  t.equal(u.thing, 'initialized',
    'Constructor should execute.');

  t.equal(u.foo && u.foo(), 'foo',
    'Constructor prototype should be mixed in.');

  t.equal(u.base, 'base',
    'Prototype property should be mixed in.');

  t.equal(u.baseFunc && u.baseFunc(), 'baseFunc',
    'Prototype function should be mixed in.');

  t.equal(u.baseOfBase, 'baseOfBase',
    'Prototype property chain should be mixed in.');

  t.equal(u.baseOfBaseFunc && u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype function chain should be mixed in.');

  t.equal(u.bar && u.bar(), 'bar',
    'Should be able to add new methods with .compose()');

  t.equal(u.baz, 'baz',
    'Should be able to add new methods with .compose()');

  t.equal(u.baseOfBaseFunc && u.baseOfBaseFunc(), 'baseOfBaseFunc',
    'Prototype chain function should be mixed in.');

  t.equal(myThing.staticFunc, Constructor.staticFunc,
    'Non prototype functions should be mixed to stamp.');

  t.equal(myThing.staticProp, 'static',
    'Non prototype properties should be mixed to stamp.');

  t.equal(myThing2.staticFunc, Constructor.staticFunc,
    'Non prototype functions should be mixed to stamp.');

  t.equal(myThing2.staticProp, 'static',
    'Non prototype properties should be mixed to stamp.');

  t.end();
});

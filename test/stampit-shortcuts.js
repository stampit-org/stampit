import test from 'tape';
import _ from 'lodash';
import stampit from '../src/stampit';

// stampit.methods, stampit.init, stampit.props, etc.

test('stampit.methods shortcut', (t) => {
  const methods = {method1() {}};
  const stamp1 = stampit({methods: methods});
  const stamp2 = stampit.methods(methods);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit.init shortcut', (t) => {
  const init = () => {};
  const stamp1 = stampit({init: init});
  const stamp2 = stampit.init(init);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit.composers shortcut', (t) => {
  const composer = () => {};
  const stamp1 = stampit({composers: composer});
  const stamp2 = stampit.composers(composer);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit.props shortcut', (t) => {
  const props = {method1() {}};
  const stamp1 = stampit({props: props});
  const stamp2 = stampit.props(props);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit.statics shortcut', (t) => {
  const statics = {method1() {}};
  const stamp1 = stampit({statics: statics});
  const stamp2 = stampit.statics(statics);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit.statics(arg1, arg2) shortcut', (t) => {
  const stamp1 = stampit.statics({foo: 1}, {bar: '2'});

  t.ok(stamp1.foo);
  t.ok(stamp1.bar);

  t.end();
});

test('stampit.propertyDescriptors shortcut', (t) => {
  const propertyDescriptors = {x: {writable: true}};
  const stamp1 = stampit({propertyDescriptors: propertyDescriptors});
  const stamp2 = stampit.propertyDescriptors(propertyDescriptors);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit.staticPropertyDescriptors shortcut', (t) => {
  const staticPropertyDescriptors = {x: {writable: true}};
  const stamp1 = stampit({staticPropertyDescriptors: staticPropertyDescriptors});
  const stamp2 = stampit.staticPropertyDescriptors(staticPropertyDescriptors);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('all shortcuts combined', (t) => {
  const {compose, methods, init} = stampit;
  const HasFoo = compose({
    properties: {
      foo: 'default foo!'
    }
  }).methods().properties().initializers().deepProperties()
    .staticProperties().staticDeepProperties()
    .configuration().deepConfiguration()
    .propertyDescriptors().staticPropertyDescriptors()
    .props().init().composers().deepProps()
    .statics().deepStatics().conf().deepConf();

  const PrintFoo = methods({
    printFoo() {
      // console.log(this.foo || 'There is no foo');
    }
  }).methods().properties().initializers().deepProperties()
    .staticProperties().staticDeepProperties()
    .configuration().deepConfiguration()
    .propertyDescriptors().staticPropertyDescriptors()
    .props().init().composers().deepProps()
    .statics().deepStatics().conf().deepConf();

  const Init = init(function ({foo}) {
    this.foo = foo;
  }).methods().properties().initializers().deepProperties()
    .staticProperties().staticDeepProperties()
    .configuration().deepConfiguration()
    .propertyDescriptors().staticPropertyDescriptors()
    .props().init().composers().deepProps()
    .statics().deepStatics().conf().deepConf();

  const Foo = compose(HasFoo, PrintFoo, Init);

  t.equal(Foo.compose.properties.foo, 'default foo!', 'the method should exit');
  t.ok(typeof Foo.compose.methods.printFoo === 'function', 'the method should exit');
  t.equal(Foo.compose.initializers.length, 1, 'should be single initializer');

  t.end();
});

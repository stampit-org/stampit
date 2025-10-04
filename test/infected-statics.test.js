import { describe, it } from "node:test";
import assert from "node:assert/strict";
import stampit from "../stampit.js";
import _ from "lodash";

describe("infected statics", () => {
  it("stampit().methods static method", () => {
    const methods = { method1() {} };
    const stamp1 = stampit({ methods: methods });
    const stamp2 = stampit().methods(methods);

    assert.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));
  });

  it("stampit().init static method", () => {
    const init = { method1() {} };
    const stamp1 = stampit({ init: init });
    const stamp2 = stampit().init(init);

    assert.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));
  });

  it("stampit().props static method", () => {
    const props = { method1() {} };
    const stamp1 = stampit({ props: props });
    const stamp2 = stampit().props(props);

    assert.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));
  });

  it("stampit().statics static method", () => {
    const statics = { method1() {} };
    const stamp1 = stampit({ statics: statics });
    const stamp2 = stampit().statics(statics);

    assert.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));
  });

  it("stampit().propertyDescriptors static method", () => {
    const propertyDescriptors = { x: { writable: true } };
    const stamp1 = stampit({ propertyDescriptors: propertyDescriptors });
    const stamp2 = stampit().propertyDescriptors(propertyDescriptors);

    assert.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));
  });

  it("stampit().staticPropertyDescriptors static method", () => {
    const staticPropertyDescriptors = { x: { writable: true } };
    const stamp1 = stampit({
      staticPropertyDescriptors: staticPropertyDescriptors,
    });
    const stamp2 = stampit().staticPropertyDescriptors(staticPropertyDescriptors);

    assert.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));
  });

  it("stampit() can be infected", () => {
    let counter = 0;
    const infectedStampit = function (...args) {
      counter += 1;
      args.push({
        staticProperties: {
          compose: infectedStampit,
        },
      });

      return stampit.apply(this, args);
    };

    const stamp = infectedStampit({ props: { a: 1 } }) // 1
      .compose({ deepProps: { b: 2 } }) // 2
      .methods({ c: 3 }) // 3
      .compose(
        // 4
        infectedStampit({ conf: { d: 4 } }), // 5
      );

    assert.equal(counter, 5, "should call infected compose 5 times");
    assert.equal(stamp.compose.properties.a, 1, "should compose properties");
    assert.equal(stamp.compose.deepProperties.b, 2, "should compose deepProperties");
    assert.equal(stamp.compose.methods.c, 3, "should compose methods");
    assert.equal(stamp.compose.configuration.d, 4, "should compose configuration");
  });
});

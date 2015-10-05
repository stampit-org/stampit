import assign from 'lodash/object/assign';
import merge from 'lodash/object/merge';
import isFunction from 'lodash/lang/isFunction';
import isArray from 'lodash/lang/isArray';
import isObject from 'lodash/lang/isObject';
import forEach from 'lodash/collection/forEach';

import stamp from './stamp';

const isDescriptor = isObject;

function isComposable(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}

function safeMutateProp(dst, src, propName, mutator) {
  const srcObj = src[propName];
  if (!isObject(srcObj)) {
    return;
  }
  const dstObj = dst[propName];
  if (!isObject(dstObj)) {
    dst[propName] = mutator({}, srcObj);
    return;
  }
  mutator(dstObj, srcObj);
}

function appendDescriptor(dst, src) {
  if (!isDescriptor(src)) {
    return;
  }
  if (isArray(src.initializers)) {
    dst.initializers = (isArray(dst.initializers) ? dst.initializers : []).concat(src.initializers);
  }
  safeMutateProp(dst, src, 'methods', assign);
  safeMutateProp(dst, src, 'properties', assign);
  safeMutateProp(dst, src, 'deepProperties', merge);
  safeMutateProp(dst, src, 'staticProperties', assign);
  safeMutateProp(dst, src, 'deepStaticProperties', merge);
  safeMutateProp(dst, src, 'propertyDescriptors', assign);
  safeMutateProp(dst, src, 'staticPropertyDescriptors', assign);
  safeMutateProp(dst, src, 'configuration', merge);
}

function compose(...args) {
  // creating stamp
  const factoryContext = {};
  const factory = stamp.bind(factoryContext); // makes a copy of the 'stamp' function object.
  const descriptor = compose.bind(factory); // makes a copy of the 'compose' function object.
  factory.compose = factoryContext.compose = descriptor;
  factoryContext.stamp = factory;

  // composing
  if (isComposable(this)) {
    appendDescriptor(descriptor, this.compose);
  }
  forEach(args, function(arg) {
    appendDescriptor(descriptor, isComposable(arg) ? arg.compose : arg);
  });

  // static properties
  if (isObject(descriptor.deepStaticProperties)) {
    merge(factory, descriptor.deepStaticProperties);
  }
  if (isObject(descriptor.staticProperties)) {
    assign(factory, descriptor.staticProperties);
  }
  if (isObject(descriptor.staticPropertyDescriptors)) {
    Object.defineProperties(factory, descriptor.staticPropertyDescriptors);
  }

  return factory;
}

export default compose;

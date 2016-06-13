import isFunction from './isFunction';
import isObject from './isObject';
import slice from './slice';
import {merge, assign} from './merge';

const isDescriptor = isObject;

/**
 * Creates new factory instance.
 * @param {object} descriptor The information about the object the factory will be creating.
 * @returns {Function} The new factory function.
 */
function createFactory(descriptor) {
  return function Stamp(options) {
    const obj = Object.create(descriptor.methods || {});

    merge(obj, descriptor.deepProperties);
    assign(obj, descriptor.properties);
    Object.defineProperties(obj, descriptor.propertyDescriptors || {});

    if (!descriptor.initializers || descriptor.initializers.length === 0) return obj;

    const args = slice.call(arguments, 1);
    if (options === undefined) options = {};
    return descriptor.initializers.filter(isFunction).reduce((resultingObj, initializer) => {
      const returnedValue = initializer.call(resultingObj, options,
        {instance: resultingObj, stamp: Stamp, args: [options].concat(args)});
      return returnedValue === undefined ? resultingObj : returnedValue;
    }, obj);
  };
}

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {object} [descriptor={}] The information about the object the stamp will be creating.
 * @param {Function} composeFunction The "compose" function implementation.
 * @returns {Function}
 */
function createStamp(descriptor, composeFunction) {
  const Stamp = createFactory(descriptor);

  merge(Stamp, descriptor.staticDeepProperties);
  assign(Stamp, descriptor.staticProperties);
  Object.defineProperties(Stamp, descriptor.staticPropertyDescriptors || {});

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function _compose() {
    return composeImplementation.apply(this, slice.call(arguments));
  };
  assign(Stamp.compose, descriptor);

  return Stamp;
}

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {object} dstDescriptor The descriptor object to merge into.
 * @param {object} [srcComposable] The composable (either descriptor or stamp) to merge data form.
 * @returns {object} Returns the dstDescriptor argument.
 */
function mergeComposable(dstDescriptor, srcComposable) {
  const srcDescriptor = (srcComposable && srcComposable.compose) || srcComposable;
  if (!isDescriptor(srcDescriptor)) return dstDescriptor;

  const combineProperty = (propName, action) => {
    if (!isObject(srcDescriptor[propName])) return;
    if (!isObject(dstDescriptor[propName])) dstDescriptor[propName] = {};
    action(dstDescriptor[propName], srcDescriptor[propName]);
  };

  combineProperty('methods', assign);
  combineProperty('properties', assign);
  combineProperty('deepProperties', merge);
  combineProperty('propertyDescriptors', assign);
  combineProperty('staticProperties', assign);
  combineProperty('staticDeepProperties', merge);
  combineProperty('staticPropertyDescriptors', assign);
  combineProperty('configuration', assign);
  combineProperty('deepConfiguration', merge);
  if (Array.isArray(srcDescriptor.initializers)) {
    dstDescriptor.initializers = srcDescriptor.initializers.reduce((result, init) => {
      if (isFunction(init) && result.indexOf(init) < 0) {
        result.push(init);
      }
      return result;
    }, Array.isArray(dstDescriptor.initializers) ? dstDescriptor.initializers : []);
  }

  return dstDescriptor;
}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @param {...(object|Function)} [composables] The list of composables.
 * @returns {Function} A new stamp (aka composable factory function).
 */
export default function compose() {
  const descriptor = [this]
    .concat(slice.call(arguments))
    .filter(isObject)
    .reduce(mergeComposable, {});
  return createStamp(descriptor, compose);
}

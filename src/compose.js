import isComposable from './isComposable';
import merge from './merge';
import {isFunction, isObject, assign, concatAssignFunctions, mergeAssign, deepMergeAssign} from './utils';

/**
 * Creates new factory instance.
 * @param {Descriptor} descriptor The information about the object the factory will be creating.
 * @returns {Function} The new factory function.
 */
function createFactory(descriptor) {
  return function Stamp(options, ...args) {
    // Next line was optimized for most JS VMs. Please, be careful here!
    let obj = Object.create(descriptor.methods || null);

    merge(obj, descriptor.deepProperties);
    assign(obj, descriptor.properties);
    Object.defineProperties(obj, descriptor.propertyDescriptors || {});

    if (!descriptor.initializers || descriptor.initializers.length === 0) return obj;

    if (options === undefined) options = {};
    const inits = descriptor.initializers;
    const length = inits.length;
    for (let i = 0; i < length; i += 1) {
      const initializer = inits[i];
      if (isFunction(initializer)) {
        const returnedValue = initializer.call(obj, options,
          {instance: obj, stamp: Stamp, args: [options].concat(args)});
        obj = returnedValue === undefined ? obj : returnedValue;
      }
    }

    return obj;
  };
}

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {Compose} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
function createStamp(descriptor, composeFunction) {
  const Stamp = createFactory(descriptor);

  merge(Stamp, descriptor.staticDeepProperties);
  assign(Stamp, descriptor.staticProperties);
  Object.defineProperties(Stamp, descriptor.staticPropertyDescriptors || {});

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function _compose(...args) {
    return composeImplementation.apply(this, args);
  };
  assign(Stamp.compose, descriptor);

  return Stamp;
}

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [srcComposable] The composable
 * (either descriptor or stamp) to merge data form.
 * @returns {Descriptor} Returns the dstDescriptor argument.
 */
function mergeComposable(dstDescriptor, srcComposable) {
  const srcDescriptor = (srcComposable && srcComposable.compose) || srcComposable;
  if (!isComposable(srcDescriptor)) return dstDescriptor;

  mergeAssign(dstDescriptor, srcDescriptor, 'methods');
  mergeAssign(dstDescriptor, srcDescriptor, 'properties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'propertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticProperties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'staticDeepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticPropertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'configuration');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepConfiguration');
  concatAssignFunctions(dstDescriptor, srcDescriptor.initializers, 'initializers');

  return dstDescriptor;
}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [composables] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
export default function compose(...composables) {
  const descriptor = [this]
    .concat(composables)
    .filter(isObject)
    .reduce(mergeComposable, {});
  return createStamp(descriptor, compose);
}


/**
 * The Stamp Descriptor
 * @typedef {Function|Object} Descriptor
 * @returns {Stamp} A new stamp based on this Stamp
 * @property {Object} [methods] Methods or other data used as object instances' prototype
 * @property {Array<Function>} [initializers] List of initializers called for each object instance
 * @property {Object} [properties] Shallow assigned properties of object instances
 * @property {Object} [deepProperties] Deeply merged properties of object instances
 * @property {Object} [staticProperties] Shallow assigned properties of Stamps
 * @property {Object} [staticDeepProperties] Deeply merged properties of Stamps
 * @property {Object} [configuration] Shallow assigned properties of Stamp arbitrary metadata
 * @property {Object} [deepConfiguration] Deeply merged properties of Stamp arbitrary metadata
 * @property {Object} [propertyDescriptors] ES5 Property Descriptors applied to object instances
 * @property {Object} [staticPropertyDescriptors] ES5 Property Descriptors applied to Stamps
 */

/**
 * The Stamp factory function
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 */

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */


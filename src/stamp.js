import assign from 'lodash/object/assign';
import merge from 'lodash/object/merge';
import isFunction from 'lodash/lang/isFunction';
import isArray from 'lodash/lang/isArray';
import isObject from 'lodash/lang/isObject';
import isUndefined from 'lodash/lang/isUndefined';
import forEach from 'lodash/collection/forEach';

export default function stamp(...args) {
  const descriptor = this.compose;
  let instance = isObject(descriptor.methods) ? Object.create(descriptor.methods) : {};
  if (isObject(descriptor.deepProperties)) { // TODO: optimize. Assign shallow first, then mutate-less deep merge.
    merge(instance, descriptor.deepProperties);
  }
  if (isObject(descriptor.properties)) {
    assign(instance, descriptor.properties);
  }
  if (isObject(descriptor.propertyDescriptors)) {
    Object.defineProperties(instance, descriptor.propertyDescriptors);
  }
  if (isArray(descriptor.initializers)) {
    const options = args[0];
    forEach(descriptor.initializers, (initializer) => {
      if (isFunction(initializer)) {
        var result = initializer.call(instance, options, {instance, stamp: this.stamp, args});
        if (!isUndefined(result)) {
          instance = result;
        }
      }
    });
  }
  return instance;
};

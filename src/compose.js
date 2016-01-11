import merge from 'lodash/object/merge';
const isFunction = (obj) => typeof obj === 'function';
const assign = Object.assign;

const getDescriptorProps = (descriptorName, composables) => {
  return !composables ? undefined : composables.map(composable => {
    const descriptor = composable.compose || composable;
    return descriptor[descriptorName];
  });
};

const createStamp = (composeMethod) => {
  const {
    methods, properties, deepProperties, propertyDescriptors, initializers,
    staticProperties, deepStaticProperties, staticPropertyDescriptors
    } = composeMethod;

  const Stamp = function Stamp(options, ...args) {
    let obj = Object.create(methods);

    merge(obj, deepProperties);
    assign(obj, properties);

    Object.defineProperties(obj, propertyDescriptors);

    initializers.forEach(initializer => {
      const returnValue = initializer.call(obj, options,
        { instance: obj, stamp: Stamp, args: [options].concat(args) });
      if (returnValue !== undefined) {
        obj = returnValue;
      }
    });

    return obj;
  };

  merge(Stamp, deepStaticProperties);
  assign(Stamp, staticProperties);
  Object.defineProperties(Stamp, staticPropertyDescriptors);
  Stamp.compose = composeMethod;

  return Stamp;
};

function compose(...composables) {
  const composeMethod = function(...args) {
    return compose(composeMethod, ...args);
  };

  const configuration = merge({},
    ...getDescriptorProps('configuration', composables));

  assign(composeMethod, {
    methods: assign({}, ...getDescriptorProps('methods', composables)),
    deepProperties: merge({},
      ...getDescriptorProps('deepProperties', composables)),
    properties: assign({}, ...getDescriptorProps('properties', composables)),
    deepStaticProperties: merge({},
      ...getDescriptorProps('deepStaticProperties', composables)),
    staticProperties: assign({},
      ...getDescriptorProps('staticProperties', composables)),
    propertyDescriptors: assign({},
      ...getDescriptorProps('propertyDescriptors', composables)),
    staticPropertyDescriptors: assign({},
      ...getDescriptorProps('staticPropertyDescriptors', composables)),
    initializers: [].concat(...getDescriptorProps('initializers', composables))
      .filter(initializer => isFunction(initializer)),
    configuration
  });

  return createStamp(composeMethod);
}

export default compose;

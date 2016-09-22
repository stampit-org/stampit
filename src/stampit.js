import standardiseDescriptor from './standardise-descriptor';
import extractFunctions from './extract-functions';
import merge from './merge';
import compose from './compose';
import isComposable from './isComposable';
import isStamp from './isStamp';

export {compose};
export {isComposable};
export {isStamp};

const assign = Object.assign;

function createUtilityFunction(propName, action) {
  return function composeUtil() {
    const descriptor = {};
    descriptor[propName] = action({}, ...arguments);
    return ((this && this.compose) || stampit).call(this, descriptor);
  };
}

export const methods = createUtilityFunction('methods', assign);

export const properties = createUtilityFunction('properties', assign);
export {properties as refs};
export {properties as props};

export function initializers(...args) {
  return ((this && this.compose) || stampit).call(this, {
    initializers: extractFunctions(...args)
  });
}
export {initializers as init};

export const deepProperties = createUtilityFunction('deepProperties', merge);
export {deepProperties as deepProps};

export const staticProperties = createUtilityFunction('staticProperties', assign);
export {staticProperties as statics};

export const staticDeepProperties = createUtilityFunction('staticDeepProperties', merge);
export {staticDeepProperties as deepStatics};

export const configuration = createUtilityFunction('configuration', assign);
export {configuration as conf};

export const deepConfiguration = createUtilityFunction('deepConfiguration', merge);
export {deepConfiguration as deepConf};

export const propertyDescriptors = createUtilityFunction('propertyDescriptors', assign);

export const staticPropertyDescriptors = createUtilityFunction('staticPropertyDescriptors', assign);

const allUtilities = {
  methods,

  properties,
  refs: properties,
  props: properties,

  initializers,
  init: initializers,

  deepProperties,
  deepProps: deepProperties,

  staticProperties,
  statics: staticProperties,

  staticDeepProperties,
  deepStatics: staticDeepProperties,

  configuration,
  conf: configuration,

  deepConfiguration,
  deepConf: deepConfiguration,

  propertyDescriptors,

  staticPropertyDescriptors
};

/**
 * Infected stamp. Used as a storage of the infection metadata
 * @type {Function}
 * @return {Stamp}
 */
const baseStampit = compose(
  {staticProperties: allUtilities},
  {
    staticProperties: {
      create(...args) {
        return this(...args);
      },
      compose: stampit // infecting
    }
  }
);

/**
 * Infected compose
 * @return {Stamp}
 */
function stampit(...args) {
  args = args.filter(isComposable)
    .map(arg => isStamp(arg) ? arg : standardiseDescriptor(arg));

  // Calling the standard pure compose function here.
  return compose.apply(this || baseStampit, args);
}

// Setting up the shortcut functions
stampit.compose = baseStampit.compose;
export default assign(stampit, allUtilities);

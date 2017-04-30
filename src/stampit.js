import standardiseDescriptor from './standardise-descriptor';
import {isArray, isFunction, assign, extractFunctions} from './utils';
import merge from './merge';
import compose from './compose';
import isComposable from './isComposable';
import isStamp from './isStamp';

function createUtilityFunction(propName, action) {
  return function composeUtil() {
    return ((this && this.compose) || stampit).call(this, {
      [propName]: action({}, ...arguments)
    });
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

export function composers(...args) {
  return ((this && this.compose) || stampit).call(this, {
    composers: extractFunctions(...args)
  });
}

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

  composers,

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
 * @param {...(Composable)} [args] The list of composables.
 * @return {Stamp}
 */
function stampit(...args) {
  const composables = args.filter(isComposable)
    .map(arg => isStamp(arg) ? arg : standardiseDescriptor(arg));

  // Calling the standard pure compose function here.
  let stamp = compose.apply(this || baseStampit, composables);

  const composerFunctions = stamp.compose.deepConfiguration &&
    stamp.compose.deepConfiguration.composers;
  if (isArray(composerFunctions) && composerFunctions.length > 0) {
    const uniqueComposers = [];
    for (let i = 0; i < composerFunctions.length; i += 1) {
      const composer = composerFunctions[i];
      if (isFunction(composer) && uniqueComposers.indexOf(composer) === -1) {
        uniqueComposers.push(composer);
      }
    }
    stamp.compose.deepConfiguration.composers = uniqueComposers;

    if (isStamp(this)) composables.unshift(this);
    for (let i = 0; i < uniqueComposers.length; i += 1) {
      const composer = uniqueComposers[i];
      const returnedValue = composer({stamp, composables});
      stamp = isStamp(returnedValue) ? returnedValue : stamp;
    }
  }

  return stamp;
}

const exportedCompose = stampit.bind(); // bind to 'undefined'
export {exportedCompose as compose};
stampit.compose = exportedCompose;

// Setting up the shortcut functions
export default assign(stampit, allUtilities);

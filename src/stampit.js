import compose from './compose';
import isComposable from './isComposable';
import isStamp from './isStamp';
export {compose};
export {isComposable};
export {isStamp};

import standardiseDescriptor from './standardise-descriptor';
import extractFunctions from './extract-functions';
import merge from './merge';

const assign = Object.assign;

/* Composition functions */

function composeArgsCall(self, propName, action, args) {
  const descriptor = {};
  descriptor[propName] = action({}, ...args);
  return ((self && self.compose) || stampit).call(self, descriptor);
}

export function methods(...args) {
  return composeArgsCall(this, 'methods', assign, args);
}

export function properties(...args) {
  return composeArgsCall(this, 'properties', assign, args);
}
export {properties as refs};
export {properties as props};

export function initializers(...args) {
  return ((this && this.compose) || stampit).call(this, {
    initializers: extractFunctions(...args)
  });
}
export {initializers as init};

export function deepProperties(...args) {
  return composeArgsCall(this, 'deepProperties', merge, args);
}
export {deepProperties as deepProps};

export function staticProperties(...args) {
  return composeArgsCall(this, 'staticProperties', assign, args);
}
export {staticProperties as statics};

export function staticDeepProperties(...args) {
  return composeArgsCall(this, 'staticDeepProperties', merge, args);
}
export {staticDeepProperties as deepStatics};

export function configuration(...args) {
  return composeArgsCall(this, 'configuration', assign, args);
}
export {configuration as conf};

export function deepConfiguration(...args) {
  return composeArgsCall(this, 'deepConfiguration', merge, args);
}
export {deepConfiguration as deepConf};

export function propertyDescriptors(...args) {
  return composeArgsCall(this, 'propertyDescriptors', assign, args);
}

export function staticPropertyDescriptors(...args) {
  return composeArgsCall(this, 'staticPropertyDescriptors', assign, args);
}

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
 * Infected stamp
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

  return compose.apply(this || baseStampit, args);
}

// Setting up the shortcut functions
stampit.compose = baseStampit.compose;
export default assign(stampit, allUtilities);

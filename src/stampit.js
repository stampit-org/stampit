import compose from './compose';
import isComposable from './isComposable';
import isStamp from './isStamp';
export {compose};
export {isComposable};
export {isStamp};

import isFunction from './isFunction';
import isObject from './isObject';
import {merge, assign} from './merge';

function extractFunctions(...args) {
  let result = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (isFunction(arg)) result.push(arg);
    else if (Array.isArray(arg)) result = result.concat(arg.filter(isFunction));
  }
  return result.length === 0 ? undefined : result;
}

function standardiseDescriptor({
  methods,

  properties,
  props,
  refs,

  initializers,
  init,

  deepProperties,
  deepProps,

  propertyDescriptors,

  staticProperties,
  statics,

  staticDeepProperties,
  deepStatics,

  staticPropertyDescriptors,

  configuration,
  conf,

  deepConfiguration,
  deepConf
} = {}) {
  const p = isObject(props) || isObject(refs) || isObject(properties) ?
    assign({}, props, refs, properties) : undefined;

  let dp = isObject(deepProps) ? merge({}, deepProps) : undefined;
  dp = isObject(deepProperties) ? merge(dp, deepProperties) : dp;

  const sp = isObject(statics) || isObject(staticProperties) ?
    assign({}, statics, staticProperties) : undefined;

  let dsp = isObject(deepStatics) ? merge({}, deepStatics) : undefined;
  dsp = isObject(staticDeepProperties) ? merge(dsp, staticDeepProperties) : dsp;

  const c = isObject(conf) || isObject(configuration) ?
    assign({}, conf, configuration) : undefined;

  let dc = isObject(deepConf) ? merge({}, deepConf) : undefined;
  dc = isObject(deepConfiguration) ? merge(dc, deepConfiguration) : dc;

  return {
    methods,
    properties: p,
    initializers: extractFunctions(init, initializers),
    deepProperties: dp,
    staticProperties: sp,
    staticDeepProperties: dsp,
    propertyDescriptors,
    staticPropertyDescriptors,
    configuration: c,
    deepConfiguration: dc
  };
}


/* Composition function */

function composeArgsCall(self, propName, action, args) {
  const descriptor = {};
  descriptor[propName] = action(...[{}].concat(args));
  return ((self && self.compose) || baseStampit.compose).call(self, descriptor);
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
  return ((this && this.compose) || baseStampit.compose).call(this, {
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

  staticPropertyDescriptors,
};

/**
 * Infected stamp
 * @type {Function}
 * @return {Stamp}
 */
const baseStampit = compose({
  staticProperties: assign({
    create(...args) {
      return this(...args);
    },

    compose(...args) {
      args = args.filter(isComposable)
        .map(arg => isStamp(arg) ? arg : standardiseDescriptor(arg));
      return compose.apply(this || baseStampit, args);
    }
  }, allUtilities)
});

/**
 * Infected compose
 * @return {Stamp}
 */
function stampit(...args) {
  return baseStampit.compose(...args);
}

export default assign(stampit,
  {
    isStamp,

    isComposable,

    compose: baseStampit.compose
  },
  allUtilities
);

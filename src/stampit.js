import compose from './compose';
import isComposable from '../isComposable';
import isStamp from '../isStamp';
import isFunction from './isFunction';
import isObject from './isObject';
import {merge, assign} from './merge';
import values from './values';

function extractFunctions(...args) {
  const functions = args.reduce((result, arg) => {
    if (isFunction(arg)) {
      return result.concat(arg);
    }
    if (Array.isArray(arg)) {
      return result.concat(extractFunctions.apply(null, arg) || []);
    }
    if (isObject(arg)) {
      return result.concat(extractFunctions.apply(null, values(arg)) || []);
    }
    return result;
  }, []);
  return functions.length === 0 ? undefined : functions;
}

function composeArgsCall(self, propName, action, args) {
  const descriptor = {};
  descriptor[propName] = action.apply(null, [{}].concat(args));
  return ((self && self.compose) || baseStampit.compose).call(self, descriptor);
}

const rawUtilities = {
  methods(...args) {
    return composeArgsCall(this, 'methods', assign, args);
  },
  properties(...args) {
    return composeArgsCall(this, 'properties', assign, args);
  },
  initializers(...args) {
    return ((this && this.compose) || baseStampit.compose).call(this, {
      initializers: extractFunctions.apply(null, args)
    });
  },
  deepProperties(...args) {
    return composeArgsCall(this, 'deepProperties', merge, args);
  },
  staticProperties(...args) {
    return composeArgsCall(this, 'staticProperties', assign, args);
  },
  staticDeepProperties(...args) {
    return composeArgsCall(this, 'staticDeepProperties', merge, args);
  },
  configuration(...args) {
    return composeArgsCall(this, 'configuration', assign, args);
  },
  deepConfiguration(...args) {
    return composeArgsCall(this, 'deepConfiguration', merge, args);
  },
  propertyDescriptors(...args) {
    return composeArgsCall(this, 'propertyDescriptors', assign, args);
  },
  staticPropertyDescriptors(...args) {
    return composeArgsCall(this, 'staticPropertyDescriptors', assign, args);
  }
};

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

/**
 * Infected stamp
 * @type {Function}
 * @return {Stamp}
 */
const baseStampit = compose({
  staticProperties: assign({
    refs: rawUtilities.properties,
    props: rawUtilities.properties,
    init: rawUtilities.initializers,
    deepProps: rawUtilities.deepProperties,
    statics: rawUtilities.staticProperties,
    deepStatics: rawUtilities.staticDeepProperties,
    conf: rawUtilities.configuration,
    deepConf: rawUtilities.deepConfiguration,
    propertyDescriptors: rawUtilities.propertyDescriptors,
    staticPropertyDescriptors: rawUtilities.staticPropertyDescriptors,

    create(...args) {
      return this.apply(undefined, args);
    },

    compose(...args) {
      args = args.filter(isComposable)
        .map(arg => isStamp(arg) ? arg : standardiseDescriptor(arg));
      return compose.apply(this || baseStampit, args);
    }
  }, rawUtilities)
});

/**
 * Infected compose
 * @return {Stamp}
 */
function stampit(...args) {
  return baseStampit.compose.apply(baseStampit, args);
}

export default assign(stampit,
  {
    isStamp,
    isComposable,
    compose: baseStampit.compose,
    refs: rawUtilities.properties,
    props: rawUtilities.properties,
    init: rawUtilities.initializers,
    deepProps: rawUtilities.deepProperties,
    statics: rawUtilities.staticProperties,
    deepStatics: rawUtilities.staticDeepProperties,
    conf: rawUtilities.configuration,
    deepConf: rawUtilities.deepConfiguration,
    propertyDescriptors: rawUtilities.propertyDescriptors,
    staticPropertyDescriptors: rawUtilities.staticPropertyDescriptors
  },
  rawUtilities
);

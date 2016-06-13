import compose from './compose';
import isComposable from '../isComposable';
import isStamp from '../isStamp';
import isFunction from './isFunction';
import isObject from './isObject';
import slice from './slice';
import {merge, assign} from './merge';
import values from './values';

function extractFunctions() {
  const functions = slice.call(arguments).reduce((result, arg) => {
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
  descriptor[propName] = action.apply(null, [{}].concat(slice.call(args)));
  return (self.compose || compose).call(self, descriptor);
}

const rawUtilities = {
  methods() {
    return composeArgsCall(this, 'methods', assign, arguments);
  },
  properties() {
    return composeArgsCall(this, 'properties', assign, arguments);
  },
  initializers() {
    return (this.compose || compose).call(this, {
      initializers: extractFunctions.apply(null, slice.call(arguments))
    });
  },
  deepProperties() {
    return composeArgsCall(this, 'deepProperties', merge, arguments);
  },
  staticProperties() {
    return composeArgsCall(this, 'staticProperties', assign, arguments);
  },
  staticDeepProperties() {
    return composeArgsCall(this, 'staticDeepProperties', merge, arguments);
  },
  configuration() {
    return composeArgsCall(this, 'configuration', assign, arguments);
  },
  deepConfiguration() {
    return composeArgsCall(this, 'deepConfiguration', merge, arguments);
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

    create() {
      return this.apply(undefined, arguments);
    },

    compose() {
      return compose.apply(this, slice.call(arguments).filter(isComposable)
        .map(arg => isStamp(arg) ? arg : standardiseDescriptor(arg)));
    }
  }, rawUtilities)
});

function stampit() {
  return baseStampit.compose.apply(baseStampit, slice.call(arguments));
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
    deepConf: rawUtilities.deepConfiguration
  },
  rawUtilities
);

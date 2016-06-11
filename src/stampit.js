import compose, {merge} from './compose';
import isComposable from '../isComposable';
import isStamp from '../isStamp';
import isFunction from '../isFunction';
import isObject from '../isObject';

function extractFunctions(...args) {
  const functions = args.reduce((result, arg) => {
    if (isFunction(arg)) { return result.concat(arg); }
    if (Array.isArray(arg)) { return result.concat(extractFunctions(...arg) || []); }
    if (isObject(arg)) { return result.concat(extractFunctions(...Object.values(arg)) || []); }
    return result;
  }, []);
  return functions.length === 0 ? undefined : functions;
}

const rawUtilities = {
  methods(...args) {
    return (this.compose || compose).call(this, {methods: Object.assign({}, ...args)});
  },
  properties(...args) {
    return (this.compose || compose).call(this, {properties: Object.assign({}, ...args)});
  },
  initializers(...args) {
    return (this.compose || compose).call(this, {initializers: extractFunctions(...args)});
  },
  deepProperties(...args) {
    return (this.compose || compose).call(this, {deepProperties: merge({}, ...args)});
  },
  staticProperties(...args) {
    return (this.compose || compose).call(this, {staticProperties: Object.assign({}, ...args)});
  },
  staticDeepProperties(...args) {
    return (this.compose || compose).call(this, {staticDeepProperties: merge({}, ...args)});
  },
  configuration(...args) {
    return (this.compose || compose).call(this, {configuration: Object.assign({}, ...args)});
  },
  deepConfiguration(...args) {
    return (this.compose || compose).call(this, {deepConfiguration: merge({}, ...args)});
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
    Object.assign({}, props, refs, properties) : undefined;

  let dp = isObject(deepProps) ? merge({}, deepProps) : undefined;
  dp = isObject(deepProperties) ? merge(dp, deepProperties) : dp;

  const sp = isObject(statics) || isObject(staticProperties) ?
    Object.assign({}, statics, staticProperties) : undefined;

  let dsp = isObject(deepStatics) ? merge({}, deepStatics) : undefined;
  dsp = isObject(staticDeepProperties) ? merge(dsp, staticDeepProperties) : dsp;

  const c = isObject(conf) || isObject(configuration) ?
    Object.assign({}, conf, configuration) : undefined;

  let dc = isObject(deepConf) ? merge({}, deepConf) : undefined;
  dc = isObject(deepConfiguration) ? merge(dc, deepConfiguration) : dc;

  return {
    methods: methods,
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
  staticProperties: Object.assign({
    refs: rawUtilities.properties,
    props: rawUtilities.properties,
    init: rawUtilities.initializers,
    deepProps: rawUtilities.deepProperties,
    statics: rawUtilities.staticProperties,
    deepStatics: rawUtilities.staticDeepProperties,
    conf: rawUtilities.configuration,
    deepConf: rawUtilities.deepConfiguration,

    create(...args) {
      return this(...args);
    },

    compose(...args) {
      return compose(this, ...args.filter(isComposable)
        .map(arg => isStamp(arg) ? arg : standardiseDescriptor(arg)));
    }
  }, rawUtilities)
});

function stampit(...args) {
  return baseStampit.compose(...args);
}

export default Object.assign(stampit,
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

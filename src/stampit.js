import assign from 'lodash/assign';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import compose, {merge} from 'stamp-specification';

export const isComposable = isObject;
export const isStamp = obj => isFunction(obj) && isFunction(obj.compose);

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
    return (this.compose || compose).call(this, {methods: assign({}, ...args)});
  },
  properties(...args) {
    return (this.compose || compose).call(this, {properties: assign({}, ...args)});
  },
  initializers(...args) {
    return (this.compose || compose).call(this, {initializers: extractFunctions(...args)});
  },
  deepProperties(...args) {
    return (this.compose || compose).call(this, {deepProperties: merge({}, ...args)});
  },
  staticProperties(...args) {
    return (this.compose || compose).call(this, {staticProperties: assign({}, ...args)});
  },
  staticDeepProperties(...args) {
    return (this.compose || compose).call(this, {staticDeepProperties: merge({}, ...args)});
  },
  configuration(...args) {
    return (this.compose || compose).call(this, {configuration: assign({}, ...args)});
  },
  deepConfiguration(...args) {
    return (this.compose || compose).call(this, {deepConfiguration: merge({}, ...args)});
  }
};

const baseStampit = compose({
  staticProperties: assign({
    refs: rawUtilities.properties,
    props: rawUtilities.properties,
    init: rawUtilities.initializers,
    deepProps: rawUtilities.deepProperties,
    statics: rawUtilities.staticProperties,
    conf: rawUtilities.configuration,
    deepConf: rawUtilities.deepConfiguration,

    create(...args) {
      return this(...args);
    }
  }, rawUtilities)
});

function convertStampitToCompose({
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

  staticPropertyDescriptors,

  configuration,
  conf,

  deepConfiguration,
  deepConf
} = {}) {
  const p = isObject(props) || isObject(refs) || isObject(properties) ?
    assign({}, props, refs, properties) : undefined;
  const dp = isObject(deepProps) || isObject(deepProperties) ?
    merge({}, deepProps, deepProperties) : undefined;
  const sp = isObject(statics) || isObject(staticProperties) ?
    assign({}, statics, staticProperties) : undefined;
  const c = isObject(conf) || isObject(configuration) ?
    assign({}, conf, configuration) : undefined;
  const dc = isObject(deepConf) || isObject(deepConfiguration) ?
    merge({}, deepConf, deepConfiguration) : undefined;
  return {
    methods: methods,
    properties: p,
    initializers: extractFunctions(init, initializers),
    deepProperties: dp,
    staticProperties: sp,
    staticDeepProperties,
    propertyDescriptors,
    staticPropertyDescriptors,
    configuration: c,
    deepConfiguration: dc
  };
}

function stampit(...args) {
  const convertedArgs = args.filter(isComposable).map(convertStampitToCompose);
  return baseStampit.compose(...convertedArgs);
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
    conf: rawUtilities.configuration,
    deepConf: rawUtilities.deepConfiguration
  },
  rawUtilities
);

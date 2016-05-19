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
  methods(...methodsObject) {
    return (this.compose || compose).call(this, {methods: assign({}, ...methodsObject)});
  },
  properties(...propertiesObject) {
    return (this.compose || compose).call(this, {properties: assign({}, ...propertiesObject)});
  },
  initializers(...args) {
    return (this.compose || compose).call(this, {initializers: extractFunctions(...args)});
  },
  deepProperties(...propertiesObject) {
    return (this.compose || compose).call(this, {deepProperties: merge({}, ...propertiesObject)});
  },
  staticProperties(...propertiesObject) {
    return (this.compose || compose).call(this, {staticProperties: assign({}, ...propertiesObject)});
  },
  staticDeepProperties(...propertiesObject) {
    return (this.compose || compose).call(this, {staticDeepProperties: merge({}, ...propertiesObject)});
  }
};

const baseStampit = compose({
  staticProperties: assign({
    refs: rawUtilities.properties,
    props: rawUtilities.properties,
    init: rawUtilities.initializers,
    deepProps: rawUtilities.deepProperties,
    statics: rawUtilities.staticProperties,

    create(...args) {
      return this(...args);
    }
  }, rawUtilities)
});

function convertStampitToComposeArgument({
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

  deepConfiguration
} = {}) {
  const p = isObject(props) || isObject(refs) || isObject(properties) ?
    assign({}, props, refs, properties) : undefined;
  const dp = isObject(deepProps) || isObject(deepProperties) ?
    merge({}, deepProps, deepProperties) : undefined;
  const sp = isObject(statics) || isObject(staticProperties) ?
    assign({}, statics, staticProperties) : undefined;
  return {
    methods: methods,
    properties: p,
    initializers: extractFunctions(init, initializers),
    deepProperties: dp,
    staticProperties: sp,
    staticDeepProperties,
    propertyDescriptors,
    staticPropertyDescriptors,
    configuration,
    deepConfiguration
  };
}

function stampit(...args) {
  const convertedArgs = args.filter(isComposable).map(convertStampitToComposeArgument);
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
    statics: rawUtilities.staticProperties
  },
  rawUtilities
);

import assign from 'lodash/assign';
import merge from 'lodash/merge';
import isObject from 'lodash/isObject';

import isComposable from './is-composable';
import compose from './compose';
import extractFunctions from './extract-functions';

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

function stampit({
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
  } = {}, ...args) {
  const p = isObject(props) || isObject(refs) || isObject(properties) ?
    assign({}, props, refs, properties) : undefined;
  const dp = isObject(deepProps) || isObject(deepProperties) ?
    merge({}, deepProps, deepProperties) : undefined;
  const sp = isObject(statics) || isObject(staticProperties) ?
    assign({}, statics, staticProperties) : undefined;
  return baseStampit.compose({
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
  }, ...args);
}

export default assign(stampit,
  {
    isStamp: isComposable,
    isComposable: isComposable,
    compose: baseStampit.compose,
    refs: rawUtilities.properties,
    props: rawUtilities.properties,
    init: rawUtilities.initializers,
    deepProps: rawUtilities.deepProperties,
    statics: rawUtilities.staticProperties
  },
  rawUtilities);

import assign from 'lodash/assign';
import merge from 'lodash/merge';
import isObject from 'lodash/isObject';

import isComposable from './is-composable';
import compose from './compose';
import extractFunctions from './extract-functions';

const rawUtilities = {
  methods(...methodsObject) {
    return (this.compose || compose)({methods: assign({}, ...methodsObject)});
  },
  properties(...propertiesObject) {
    return (this.compose || compose)({properties: assign({}, ...propertiesObject)});
  },
  initializers(...args) {
    return (this.compose || compose)({initializers: extractFunctions(...args)});
  },
  deepProperties(...propertiesObject) {
    return (this.compose || compose)({deepProperties: merge({}, ...propertiesObject)});
  },
  staticProperties(...propertiesObject) {
    return (this.compose || compose)({staticProperties: assign({}, ...propertiesObject)});
  },
  deepStaticProperties(...propertiesObject) {
    return (this.compose || compose)({staticDeepProperties: merge({}, ...propertiesObject)});
  }
};

const baseStampit = compose({
  initializers: [function(options) {
    assign(this, options);
  }],
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

  deepStaticProperties,

  staticPropertyDescriptors,

  configuration
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
    deepStaticProperties,
    propertyDescriptors,
    staticPropertyDescriptors,
    configuration
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

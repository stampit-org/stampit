import assign from 'lodash/object/assign';
import merge from 'lodash/object/merge';
import isFunction from 'lodash/lang/isFunction';
import isArray from 'lodash/lang/isArray';
import isObject from 'lodash/lang/isObject';
import isUndefined from 'lodash/lang/isUndefined';
import forEach from 'lodash/collection/forEach';

import compose from './compose';

function extractFunctions(...args) {
  const result = [];
  if (isFunction(args[0])) {
    forEach(args, fn => { // assuming all the arguments are functions
      if (isFunction(fn)) {
        result.push(fn);
      }
    });
  } else if (isObject(args[0])) {
    forEach(args, obj => {
      forEach(obj, fn => {
        if (isFunction(fn)) {
          result.push(fn);
        }
      });
    });
  }
  return result;
}

function baseStampitProperties(...properties) {
  return this.compose({ properties: assign({}, ...properties) });
}
function baseStampitDeepProperties(...properties) {
  return this.compose({ properties: assign({}, ...properties) });
}
function baseStampitInitializers(...args) {
  return this.compose({ initializers: extractFunctions(...args) });
}
const baseStampitFactory = compose({ staticProperties: {
  properties: baseStampitProperties,
  refs: baseStampitFactory,
  state: baseStampitFactory,

  initializers: baseStampitInitializers,
  init: baseStampitInitializers,
  enclose: baseStampitInitializers,

  deepProperties: baseStampitDeepProperties,
  props: baseStampitDeepProperties,
}});

function stampit({
  methods,

  properties,
  refs,
  state,

  initializers,
  init,
  enclose,

  deepProperties,
  props,

  propertyDescriptors,

  staticProperties,
  static,

  deepStaticProperties,

  staticPropertyDescriptors,

  configuration
  }, ...args) {
  return compose({
    methods,
    properties: assign({}, state, refs, properties),
    initializers: [].concat(initializers, init, enclose),
    deepProperties: merge({}, props, deepProperties),
    staticProperties: assign({}, static, staticProperties),
    propertyDescriptors,
    deepStaticProperties,
    staticPropertyDescriptors,
    configuration
  }, ...args);
}

export default assign(stampit, {
  compose,

  methods,

  properties,
  refs,
  state,

  enclose,
  init,

  deepProperties,
  props,
  deepProps,

  staticProperties,
  static,

  deepStaticProperties

});

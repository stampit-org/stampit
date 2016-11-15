import {assign, isObject, extractFunctions, concatAssignFunctions} from './utils';
import merge from './merge';

/**
 * Converts stampit extended descriptor to a standard one.
 * @param [methods]
 * @param [properties]
 * @param [props]
 * @param [refs]
 * @param [initializers]
 * @param [init]
 * @param [deepProperties]
 * @param [deepProps]
 * @param [propertyDescriptors]
 * @param [staticProperties]
 * @param [statics]
 * @param [staticDeepProperties]
 * @param [deepStatics]
 * @param [staticPropertyDescriptors]
 * @param [configuration]
 * @param [conf]
 * @param [deepConfiguration]
 * @param [deepConf]
 * @param [composers]
 * @returns {Descriptor}
 */
export default function ({
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
  deepConf,

  composers
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

  const ii = extractFunctions(init, initializers);

  const composerFunctions = extractFunctions(composers);
  if (composerFunctions) {
    dc = dc || {};
    concatAssignFunctions(dc, composerFunctions, 'composers');
  }

  const descriptor = {};
  if (methods) descriptor.methods = methods;
  if (p) descriptor.properties = p;
  if (ii) descriptor.initializers = ii;
  if (dp) descriptor.deepProperties = dp;
  if (sp) descriptor.staticProperties = sp;
  if (methods) descriptor.methods = methods;
  if (dsp) descriptor.staticDeepProperties = dsp;
  if (propertyDescriptors) descriptor.propertyDescriptors = propertyDescriptors;
  if (staticPropertyDescriptors) descriptor.staticPropertyDescriptors = staticPropertyDescriptors;
  if (c) descriptor.configuration = c;
  if (dc) descriptor.deepConfiguration = dc;

  return descriptor;
}

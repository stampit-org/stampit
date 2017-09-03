var _undefined;
var _function = 'function';
var _object = 'object';
var _methods = 'methods';
var _properties = 'properties';
var _deepProperties = 'deepProperties';
var _propertyDescriptors = 'propertyDescriptors';
var _staticProperties = 'staticProperties';
var _staticDeepProperties = 'staticDeepProperties';
var _staticPropertyDescriptors = 'staticPropertyDescriptors';
var _configuration = 'configuration';
var _deepConfiguration = 'deepConfiguration';
var _initializers = 'initializers';
var _composers = 'composers';
var isArray = Array.isArray;
var arrayPrototype = Array.prototype;
var concat = arrayPrototype.concat;
var slice = arrayPrototype.slice;

var assign = Object.assign || function assign(to) {
  var args = arguments, s = 1, from, key;
  for (; s < args.length; s++) {
    from = args[s];

    for (key in Object.keys(from)) { // eslint-disable-line
      to[key] = from[key];
    }
  }

  return to;
};


function isFunction(obj) {
  return typeof obj === _function;
}

function isObject(obj) {
  var type = typeof obj;
  return !!obj && (type === _object || type === _function);
}

function isPlainObject(value) {
  return !!value && typeof value === _object &&
    Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param {Array|Object|*} dst Destination
 * @param {Array|Object|*} src Source
 * @returns {Array|Object|*} The `dst` argument
 */
function mergeOne(dst, src) {
  if (src === _undefined) return dst;

  // According to specification arrays must be concatenated.
  // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
  if (isArray(src)) return (isArray(dst) ? dst : []).concat(src);

  // Now deal with non plain 'src' object. 'src' overrides 'dst'
  // Note that functions are also assigned! We do not deep merge functions.
  if (!isPlainObject(src)) return src;

  // See if 'dst' is allowed to be mutated.
  // If not - it's overridden with a new plain object.
  var returnValue = isObject(dst) ? dst : {};

  var keys = Object.keys(src);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    var srcValue = src[key];
    // Do not merge properties with the '_undefined' value.
    if (srcValue !== _undefined) {
      var dstValue = returnValue[key];
      // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
      var newDst = isPlainObject(dstValue) || isArray(srcValue) ? dstValue : {};

      // deep merge each property. Recursion!
      returnValue[key] = mergeOne(newDst, srcValue);
    }
  }

  return returnValue;
}

function merge(dst) {
  for (var i = 1; i < arguments.length; i++) {
    dst = mergeOne(dst, arguments[i]);
  }
  return dst;
}


function extractFunctions() {
  var fns = concat.apply([], arguments).filter(isFunction);
  return fns.length === 0 ? _undefined : fns;
}

function concatAssignFunctions(dstObject, srcArray, propName) {
  if (!isArray(srcArray)) {
    return;
  }

  var length = srcArray.length;
  var dstArray = dstObject[propName] || [];
  var i = 0;
  dstObject[propName] = dstArray;
  for (; i < length; i++) {
    var fn = srcArray[i];
    if (isFunction(fn) && dstArray.indexOf(fn) < 0) {
      dstArray.push(fn);
    }
  }
}


function combineProperties(dstObject, srcObject, propName, action) {
  if (!isObject(srcObject[propName])) {
    return;
  }
  if (!isObject(dstObject[propName])) {
    dstObject[propName] = {};
  }
  action(dstObject[propName], srcObject[propName]);
}

function deepMergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, merge);
}

function mergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, assign);
}

/**
 * Converts stampit extended descriptor to a standard one.
 * @param {Object|*} descr
 * methods
 * properties
 * props
 * refs
 * initializers
 * [init
 * deepProperties
 * deepProps
 * propertyDescriptors
 * staticProperties
 * statics
 * staticDeepProperties
 * deepStatics
 * staticPropertyDescriptors
 * configuration
 * conf
 * deepConfiguration
 * deepConf
 * composers
 * @returns {Descriptor} Standardised descriptor
 */
function standardiseDescriptor(descr) {
  if (!isObject(descr)) return descr;

  var methods = descr[_methods];
  var properties = descr[_properties];
  var props = descr.props;
  var refs = descr.refs;
  var initializers = descr[_initializers];
  var init = descr.init;
  var composers = descr[_composers];
  var deepProperties = descr[_deepProperties];
  var deepProps = descr.deepProps;
  var propertyDescriptors = descr[_propertyDescriptors];
  var staticProperties = descr[_staticProperties];
  var statics = descr.statics;
  var staticDeepProperties = descr[_staticDeepProperties];
  var deepStatics = descr.deepStatics;
  var staticPropertyDescriptors = descr[_staticPropertyDescriptors];
  var configuration = descr[_configuration];
  var conf = descr.conf;
  var deepConfiguration = descr[_deepConfiguration];
  var deepConf = descr.deepConf;

  var p = isObject(props) || isObject(refs) || isObject(properties) ?
    assign({}, props, refs, properties) : _undefined;

  var dp = isObject(deepProps) ? merge({}, deepProps) : _undefined;
  dp = isObject(deepProperties) ? merge(dp, deepProperties) : dp;

  var sp = isObject(statics) || isObject(staticProperties) ?
    assign({}, statics, staticProperties) : _undefined;

  var dsp = isObject(deepStatics) ? merge({}, deepStatics) : _undefined;
  dsp = isObject(staticDeepProperties) ? merge(dsp, staticDeepProperties) : dsp;

  var c = isObject(conf) || isObject(configuration) ?
    assign({}, conf, configuration) : _undefined;

  var dc = isObject(deepConf) ? merge({}, deepConf) : _undefined;
  dc = isObject(deepConfiguration) ? merge(dc, deepConfiguration) : dc;

  var ii = extractFunctions(init, initializers);

  var composerFunctions = extractFunctions(composers);
  if (composerFunctions) {
    dc = dc || {};
    concatAssignFunctions(dc, composerFunctions, _composers);
  }

  var descriptor = {};
  if (methods) descriptor[_methods] = methods;
  if (p) descriptor[_properties] = p;
  if (ii) descriptor[_initializers] = ii;
  if (dp) descriptor[_deepProperties] = dp;
  if (sp) descriptor[_staticProperties] = sp;
  if (methods) descriptor[_methods] = methods;
  if (dsp) descriptor[_staticDeepProperties] = dsp;
  if (propertyDescriptors) descriptor[_propertyDescriptors] = propertyDescriptors;
  if (staticPropertyDescriptors) descriptor[_staticPropertyDescriptors] = staticPropertyDescriptors;
  if (c) descriptor[_configuration] = c;
  if (dc) descriptor[_deepConfiguration] = dc;

  return descriptor;
}

/**
 * Creates new factory instance.
 * @returns {Function} The new factory function.
 */
function createFactory() {
  return function Stamp(options) {
    var descriptor = Stamp.compose || {};
    // Next line was optimized for most JS VMs. Please, be careful here!
    var obj = Object.create(descriptor[_methods] || null);

    merge(obj, descriptor[_deepProperties]);
    assign(obj, descriptor[_properties]);
    Object.defineProperties(obj, descriptor[_propertyDescriptors] || {});

    if (!descriptor[_initializers] || descriptor[_initializers].length === 0) return obj;

    if (options === _undefined) options = {};
    var inits = descriptor[_initializers];
    var length = inits.length, i = 0, initializer, returnedValue;
    for (; i < length; i++) {
      initializer = inits[i];
      if (isFunction(initializer)) {
        returnedValue = initializer.call(obj, options,
          {instance: obj, stamp: Stamp, args: slice.apply(arguments)});
        obj = returnedValue === _undefined ? obj : returnedValue;
      }
    }

    return obj;
  };
}

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @returns {Stamp} The new stamp
 */
function createStamp(descriptor) {
  var Stamp = createFactory();

  var tmp = descriptor[_staticDeepProperties];
  if (tmp) {
    merge(Stamp, tmp);
  }
  tmp = descriptor[_staticProperties];
  if (tmp) {
    assign(Stamp, tmp);
  }
  tmp = descriptor[_staticPropertyDescriptors];
  if (tmp) {
    Object.defineProperties(Stamp, tmp);
  }

  var composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : compose;
  Stamp.compose = function _compose() {
    return composeImplementation.apply(this, arguments);
  };
  assign(Stamp.compose, descriptor);

  return Stamp;
}

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [srcComposable] The composable
 * (either descriptor or stamp) to merge data form.
 * @returns {Descriptor} Returns the dstDescriptor argument.
 */
function mergeComposable(dstDescriptor, srcComposable) {
  var srcDescriptor = (srcComposable && srcComposable.compose) || srcComposable;
  if (!isObject(srcDescriptor)) {
    return dstDescriptor;
  }

  mergeAssign(dstDescriptor, srcDescriptor, _methods);
  mergeAssign(dstDescriptor, srcDescriptor, _properties);
  deepMergeAssign(dstDescriptor, srcDescriptor, _deepProperties);
  mergeAssign(dstDescriptor, srcDescriptor, _propertyDescriptors);
  mergeAssign(dstDescriptor, srcDescriptor, _staticProperties);
  deepMergeAssign(dstDescriptor, srcDescriptor, _staticDeepProperties);
  mergeAssign(dstDescriptor, srcDescriptor, _staticPropertyDescriptors);
  mergeAssign(dstDescriptor, srcDescriptor, _configuration);
  deepMergeAssign(dstDescriptor, srcDescriptor, _deepConfiguration);
  concatAssignFunctions(dstDescriptor, srcDescriptor[_initializers], _initializers);

  return dstDescriptor;
}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * Parameters:  {...Composable} The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
function compose() {
  var descriptor = concat.apply([this], arguments)
  .filter(isObject)
  .reduce(mergeComposable, {});
  return createStamp(descriptor);
}


/**
 * The Stamp Descriptor
 * @typedef {Function|Object} Descriptor
 * @returns {Stamp} A new stamp based on this Stamp
 * @property {Object} [methods] Methods or other data used as object instances' prototype
 * @property {Array<Function>} [initializers] List of initializers called for each object instance
 * @property {Object} [properties] Shallow assigned properties of object instances
 * @property {Object} [deepProperties] Deeply merged properties of object instances
 * @property {Object} [staticProperties] Shallow assigned properties of Stamps
 * @property {Object} [staticDeepProperties] Deeply merged properties of Stamps
 * @property {Object} [configuration] Shallow assigned properties of Stamp arbitrary metadata
 * @property {Object} [deepConfiguration] Deeply merged properties of Stamp arbitrary metadata
 * @property {Object} [propertyDescriptors] ES5 Property Descriptors applied to object instances
 * @property {Object} [staticPropertyDescriptors] ES5 Property Descriptors applied to Stamps
 */

/**
 * The Stamp factory function
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 */

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */

/**
 * Returns true if argument is a stamp.
 * @param {*} obj Any object
 * @returns {Boolean} True is the obj is a stamp
 */
function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}

function createUtilityFunction(propName, action) {
  return function composeUtil() {
    var obj = {};
    var args = concat.apply([{}], arguments);
    obj[propName] = action.apply(_undefined, args);

    return ((this && this.compose) || stampit).call(this, obj);
  };
}

var methodsShortcut = createUtilityFunction(_methods, assign);

var propertiesShortcut = createUtilityFunction(_properties, assign);

function initializersShortcut() {
  return ((this && this.compose) || stampit).call(this, {
    initializers: extractFunctions.apply(_undefined, slice.apply(arguments))
  });
}

function composersShortcut() {
  return ((this && this.compose) || stampit).call(this, {
    composers: extractFunctions.apply(_undefined, slice.apply(arguments))
  });
}

var deepPropertiesShortcut = createUtilityFunction(_deepProperties, merge);
var staticPropertiesShortcut = createUtilityFunction(_staticProperties, assign);
var staticDeepPropertiesShortcut = createUtilityFunction(_staticDeepProperties, merge);
var configurationShortcut = createUtilityFunction(_configuration, assign);
var deepConfigurationShortcut = createUtilityFunction(_deepConfiguration, merge);
var propertyDescriptorsShortcut = createUtilityFunction(_propertyDescriptors, assign);

var staticPropertyDescriptorsShortcut = createUtilityFunction(_staticPropertyDescriptors, assign);

var allUtilities = {};

allUtilities[_methods] = methodsShortcut;

allUtilities[_properties] = propertiesShortcut;
allUtilities.refs = propertiesShortcut;
allUtilities.props = propertiesShortcut;

allUtilities[_initializers] = initializersShortcut;
allUtilities.init = initializersShortcut;

allUtilities[_composers] = composersShortcut;

allUtilities[_deepProperties] = deepPropertiesShortcut;
allUtilities.deepProps = deepPropertiesShortcut;

allUtilities[_staticProperties] = staticPropertiesShortcut;
allUtilities.statics = staticPropertiesShortcut;

allUtilities[_staticDeepProperties] = staticDeepPropertiesShortcut;
allUtilities.deepStatics = staticDeepPropertiesShortcut;

allUtilities[_configuration] = configurationShortcut;
allUtilities.conf = configurationShortcut;

allUtilities[_deepConfiguration] = deepConfigurationShortcut;
allUtilities.deepConf = deepConfigurationShortcut;

allUtilities[_propertyDescriptors] = propertyDescriptorsShortcut;

allUtilities[_staticPropertyDescriptors] = staticPropertyDescriptorsShortcut;

/**
 * Infected stamp. Used as a storage of the infection metadata
 * @type {Function}
 * @return {Stamp}
 */
var baseStampit = compose(
  {staticProperties: allUtilities},
  {
    staticProperties: {
      create: function create() {
        return this.apply(_undefined, slice.apply(arguments));
      },
      compose: stampit // infecting
    }
  }
);

/**
 * Infected compose
 * Parameters:  {...Composable} The list of composables.
 * @return {Stamp} The Stampit-flavoured stamp
 */
function stampit() {
  var i = 0, arg, composables = [], stamp, composerFunctions, uniqueComposers, composer, returnedValue;
  for (; i < arguments.length; i++) {
    arg = arguments[i];
    if (isObject(arg)) {
      composables.push(isStamp(arg) ? arg : standardiseDescriptor(arg));
    }
  }

  // Calling the standard pure compose function here.
  stamp = compose.apply(this || baseStampit, composables);

  composerFunctions = stamp.compose[_deepConfiguration] &&
    stamp.compose[_deepConfiguration][_composers];
  if (isArray(composerFunctions) && composerFunctions.length > 0) {
    uniqueComposers = [];
    for (i = 0; i < composerFunctions.length; i++) {
      composer = composerFunctions[i];
      if (isFunction(composer) && uniqueComposers.indexOf(composer) < 0) {
        uniqueComposers.push(composer);
      }
    }
    stamp.compose[_deepConfiguration].composers = uniqueComposers;

    if (isStamp(this)) {
      composables.unshift(this);
    }
    for (i = 0; i < uniqueComposers.length; i++) {
      composer = uniqueComposers[i];
      returnedValue = composer({stamp: stamp, composables: composables});
      stamp = isStamp(returnedValue) ? returnedValue : stamp;
    }
  }

  return stamp;
}

var exportedCompose = stampit.bind(); // bind to undefined
stampit.compose = exportedCompose;

// Setting up the shortcut functions
module.exports = assign(stampit, allUtilities);

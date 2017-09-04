!function() {
  'use strict';
  var _undefined;

  var _object = 'object';
  var _methods = 'methods';
  var _roperties = 'roperties';
  var _properties = 'p' + _roperties;
  var _deep = 'deep';
  var _deepProperties = _deep + 'P' + _roperties;
  var _deepProps = _deep + 'Props';
  var _ropertyDescriptors = 'ropertyDescriptors';
  var _propertyDescriptors = 'p' + _ropertyDescriptors;
  var _static = 'static';
  var _staticProperties = _static + 'P' + _roperties;
  var _staticDeepProperties = _static + 'DeepP' + _roperties;
  var _deepStatics = _deep + 'Statics';
  var _staticPropertyDescriptors = _static + 'P' + _ropertyDescriptors;
  var _onfiguration = 'onfiguration';
  var _configuration = 'c' + _onfiguration;
  var _deepConfiguration = _deep + 'C' + _onfiguration;
  var _deepConf = _deep + 'Conf';
  var _initializers = 'initializers';
  var _composers = 'composers';
  var _compose = 'compose';
  var _length = 'length';
  var _Object = Object;
  var isArray = Array.isArray;
  var arrayPrototype = Array.prototype;
  var concat = arrayPrototype.concat;
  var slice = arrayPrototype.slice;
  var defineProperties = _Object.defineProperties;
  var objectKeys = _Object.keys;

  var assign = _Object.assign || function(to) {
    var args = arguments, s = 1, from, keys, i;

    for (; s < args[_length]; s++) {
      from = args[s];
      if (from) {
        keys = objectKeys(from);
        for (i = 0; i < keys[_length]; i++) {
          to[keys[i]] = from[keys[i]];
        }
      }
    }

    return to;
  };


  function isFunction(obj) {
    return typeof obj == 'function';
  }

  function isObject(obj) {
    return obj && (typeof obj == _object || isFunction(obj));
  }

  function isPlainObject(value) {
    return value && typeof value == _object &&
      _Object.getPrototypeOf(value) == _Object.prototype;
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

    var keys = objectKeys(src), i = 0, key, srcValue, dstValue, newDst;
    for (; i < keys[_length]; i++) {
      key = keys[i];

      srcValue = src[key];
      // Do not merge properties with the '_undefined' value.
      if (srcValue !== _undefined) {
        dstValue = returnValue[key];
        // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
        newDst = isPlainObject(dstValue) || isArray(srcValue) ? dstValue : {};

        // deep merge each property. Recursion!
        returnValue[key] = mergeOne(newDst, srcValue);
      }
    }

    return returnValue;
  }

  function merge(dst) {
    var i = 1, args = arguments;
    for (; i < args[_length]; i++) {
      dst = mergeOne(dst, args[i]);
    }
    return dst;
  }

  function extractFunctions() {
    var fns = concat.apply([], arguments).filter(isFunction);
    return fns[_length] == 0 ? _undefined : fns;
  }

  function pushUniqueFuncs(dst, src) {
    var i = 0, fn;
    for (; i < src[_length]; i++) {
      fn = src[i];
      if (isFunction(fn) && dst.indexOf(fn) < 0) {
        dst.push(fn);
      }
    }
  }

  function concatAssignFunctions(dstObject, srcArray, propName) {
    if (!isArray(srcArray)) {
      return;
    }

    pushUniqueFuncs(dstObject[propName] = dstObject[propName] || [], srcArray);
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
    var descriptor = {};

    descriptor[_methods] = descr[_methods] || _undefined;

    var v1 = descr[_properties];
    var v2 = descr.props;
    var v3 = descr.refs;
    descriptor[_properties] = isObject(v1 || v2 || v3) ? assign({}, v3, v2, v1) : _undefined;

    descriptor[_initializers] = extractFunctions(descr.init, descr[_initializers]);

    v1 = descr[_deepProperties];
    v2 = descr[_deepProps];
    descriptor[_deepProperties] = isObject(v1 || v2) ? merge({}, v2, v1) : _undefined;

    descriptor[_propertyDescriptors] = descr[_propertyDescriptors];

    v1 = descr[_staticProperties];
    v2 = descr.statics;
    descriptor[_staticProperties] = isObject(v1 || v2) ? assign({}, v2, v1) : _undefined;

    v1 = descr[_staticDeepProperties];
    v2 = descr[_deepStatics];
    descriptor[_staticDeepProperties] = isObject(v1 || v2) ? merge({}, v2, v1) : _undefined;

    descriptor[_staticPropertyDescriptors] = descr[_staticPropertyDescriptors];

    v1 = descr[_configuration];
    v2 = descr.conf;
    descriptor[_configuration] = isObject(v1 || v2) ? assign({}, v2, v1) : _undefined;

    v1 = descr[_deepConfiguration];
    v2 = descr[_deepConf];
    v3 = isObject(v1 || v2) ? merge({}, v2, v1) : _undefined;

    v1 = extractFunctions(descr[_composers]);
    if (v1) {
      v3 = v3 || {};
      concatAssignFunctions(v3, v1, _composers);
    }

    descriptor[_deepConfiguration] = v3;

    return descriptor;
  }

  /**
   * Creates new factory instance.
   * @returns {Function} The new factory function.
   */
  function createFactory() {
    return function Stamp(options) {
      var descriptor = Stamp[_compose] || {};
      // Next line was optimized for most JS VMs. Please, be careful here!
      var obj = _Object.create(descriptor[_methods] || null);

      var tmp = descriptor[_deepProperties];
      if (tmp) merge(obj, tmp);
      tmp = descriptor[_properties];
      if (tmp) assign(obj, tmp);
      tmp = descriptor[_propertyDescriptors];
      if (tmp) defineProperties(obj, tmp);

      if (!descriptor[_initializers] || descriptor[_initializers][_length] == 0) return obj;

      if (options === _undefined) options = {};
      var inits = descriptor[_initializers], args = slice.apply(arguments);
      var length = inits[_length], i = 0, initializer, returnedValue;
      for (; i < length; i++) {
        initializer = inits[i];
        if (isFunction(initializer)) {
          returnedValue = initializer.call(obj, options,
            {instance: obj, stamp: Stamp, args: args});
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
    var stamp = createFactory();

    var tmp = descriptor[_staticDeepProperties];
    if (tmp) {
      merge(stamp, tmp);
    }
    tmp = descriptor[_staticProperties];
    if (tmp) {
      assign(stamp, tmp);
    }
    tmp = descriptor[_staticPropertyDescriptors];
    if (tmp) {
      defineProperties(stamp, tmp);
    }

    var composeImplementation = isFunction(stamp[_compose]) ? stamp[_compose] : compose;
    stamp[_compose] = function() {
      return composeImplementation.apply(this, arguments);
    };
    assign(stamp[_compose], descriptor);

    return stamp;
  }

  /**
   * Mutates the dstDescriptor by merging the srcComposable data into it.
   * @param {Descriptor} dstDescriptor The descriptor object to merge into.
   * @param {Composable} [srcComposable] The composable
   * (either descriptor or stamp) to merge data form.
   * @returns {Descriptor} Returns the dstDescriptor argument.
   */
  function mergeComposable(dstDescriptor, srcComposable) {
    var srcDescriptor = (srcComposable && srcComposable[_compose]) || srcComposable;
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
    return isFunction(obj) && isFunction(obj[_compose]);
  }

  function createUtilityFunction(propName, action) {
    return function() {
      var obj = {};
      var args = concat.apply([{}], arguments);
      obj[propName] = action.apply(_undefined, args);

      return ((this && this[_compose]) || _stampit).call(this, obj);
    };
  }

  var allUtilities = {};

  allUtilities[_methods] = createUtilityFunction(_methods, assign);

  allUtilities[_properties] = allUtilities.refs = allUtilities.props =
    createUtilityFunction(_properties, assign);

  allUtilities[_initializers] = allUtilities.init =
    createUtilityFunction(_initializers, extractFunctions);

  allUtilities[_composers] = createUtilityFunction(_composers, extractFunctions);

  allUtilities[_deepProperties] = allUtilities[_deepProps] =
    createUtilityFunction(_deepProperties, merge);

  allUtilities[_staticProperties] = allUtilities.statics =
    createUtilityFunction(_staticProperties, assign);

  allUtilities[_staticDeepProperties] = allUtilities[_deepStatics] =
    createUtilityFunction(_staticDeepProperties, merge);

  allUtilities[_configuration] = allUtilities.conf =
    createUtilityFunction(_configuration, assign);

  allUtilities[_deepConfiguration] = allUtilities[_deepConf] =
    createUtilityFunction(_deepConfiguration, merge);

  allUtilities[_propertyDescriptors] = createUtilityFunction(_propertyDescriptors, assign);

  allUtilities[_staticPropertyDescriptors] = createUtilityFunction(_staticPropertyDescriptors, assign);

  /**
   * Infected compose
   * Parameters:  {...Composable} The list of composables.
   * @return {Stamp} The Stampit-flavoured stamp
   */
  var _stampit = function stampit() {
    var i = 0, arg, composables = [], stamp, uniqueComposers, returnedValue, args = arguments;
    for (; i < args[_length]; i++) {
      arg = args[i];
      if (isObject(arg)) {
        composables.push(isStamp(arg) ? arg : standardiseDescriptor(arg));
      }
    }

    // Calling the standard pure compose function here.
    stamp = compose.apply(this || baseStampit, composables);

    var deepConf = stamp[_compose][_deepConfiguration];
    var composerFunctions = deepConf && deepConf[_composers];
    if (composerFunctions && composerFunctions[_length] > 0) {
      pushUniqueFuncs(deepConf[_composers] = uniqueComposers = [], composerFunctions);

      if (isStamp(this)) {
        composables.unshift(this);
      }
      for (i = 0; i < uniqueComposers[_length]; i++) {
        returnedValue = uniqueComposers[i]({stamp: stamp, composables: composables});
        stamp = isStamp(returnedValue) ? returnedValue : stamp;
      }
    }

    return stamp;
  };

  _static = {};
  _static[_staticProperties] = assign({}, allUtilities, {
    create: function() {
      return this.apply(_undefined, arguments);
    },
    compose: _stampit // infecting
  });

  /**
   * Infected stamp. Used as a storage of the infection metadata
   * @type {Function}
   * @return {Stamp}
   */
  var baseStampit = compose(_static);

  // Setting up the shortcut functions
  assign(_stampit, allUtilities);

  _stampit[_compose] = _stampit.bind(); // bind to undefined

  if (typeof _undefined != typeof module) module.exports = _stampit; else self.stampit = _stampit;
}();

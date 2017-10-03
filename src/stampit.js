!function() {
  var _undefined;

  var var1 = 'roperties';
  var var2 = 'ropertyDescriptors';
  var var3 = 'static';
  var var4 = 'onfiguration';
  var _properties = 'p' + var1;
  var _deepProperties = 'deepP' + var1;
  var _propertyDescriptors = 'p' + var2;
  var _staticProperties = var3 + 'P' + var1;
  var _staticDeepProperties = var3 + 'DeepP' + var1;
  var _staticPropertyDescriptors = var3 + 'P' + var2;
  var _configuration = 'c' + var4;
  var _deepConfiguration = 'deepC' + var4;
  var _deepProps = 'deepProps';
  var _deepStatics = 'deepStatics';
  var _deepConf = 'deepConf';
  var _initializers = 'initializers';
  var _methods = 'methods';
  var _composers = 'composers';
  var _compose = 'compose';
  var _object = 'object';
  var _length = 'length';
  var _Object = Object;
  var isArray = Array.isArray;
  var defineProperties = _Object.defineProperties;
  var objectKeys = _Object.keys;
  var3 = Array.prototype;
  var concat = var3.concat;
  var slice = var3.slice;

  var assign = _Object.assign || function(to) {
    var args = arguments, s = 1, from, keys, i;

    for (; s < args[_length];) {
      from = args[s++];
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
      value.__proto__ == _Object.prototype;
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
    for (; i < keys[_length];) {
      key = keys[i++];

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
    return slice.call(arguments, 1).reduce(mergeOne, dst);
  }

  function extractFunctions() {
    var1 = concat.apply([], arguments).filter(isFunction);
    return var1[_length] == 0 ? _undefined : var1;
  }

  function pushUniqueFuncs(dst, src) {
    var i = 0, fn;
    for (; i < src[_length]; i) {
      fn = src[i++];
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
    var4 = {};

    var4[_methods] = descr[_methods] || _undefined;

    var1 = descr[_properties];
    var2 = descr.props;
    var3 = descr.refs;
    var4[_properties] = isObject(var1 || var2 || var3) ? assign({}, var3, var2, var1) : _undefined;

    var4[_initializers] = extractFunctions(descr.init, descr[_initializers]);

    var1 = descr[_deepProperties];
    var2 = descr[_deepProps];
    var4[_deepProperties] = isObject(var1 || var2) ? merge({}, var2, var1) : _undefined;

    var4[_propertyDescriptors] = descr[_propertyDescriptors];

    var1 = descr[_staticProperties];
    var2 = descr.statics;
    var4[_staticProperties] = isObject(var1 || var2) ? assign({}, var2, var1) : _undefined;

    var1 = descr[_staticDeepProperties];
    var2 = descr[_deepStatics];
    var4[_staticDeepProperties] = isObject(var1 || var2) ? merge({}, var2, var1) : _undefined;

    var4[_staticPropertyDescriptors] = descr[_staticPropertyDescriptors];

    var1 = descr[_configuration];
    var2 = descr.conf;
    var4[_configuration] = isObject(var1 || var2) ? assign({}, var2, var1) : _undefined;

    var1 = descr[_deepConfiguration];
    var2 = descr[_deepConf];
    var3 = isObject(var1 || var2) ? merge({}, var2, var1) : _undefined;

    var1 = extractFunctions(descr[_composers]);
    if (var1) {
      var3 = var3 || {};
      concatAssignFunctions(var3, var1, _composers);
    }

    var4[_deepConfiguration] = var3;

    return var4;
  }

  /**
   * Creates new factory instance.
   * @returns {Function} The new factory function.
   */
  function createFactory() {
    return function Stamp(options) {
      var i = Stamp[_compose] || {};
      // Next line was optimized for most JS VMs. Please, be careful here!
      var obj = _Object.create(i[_methods] || null);

      var inits = i[_initializers], args = slice.apply(arguments);
      var initializer, returnedValue;

      var tmp = i[_deepProperties];
      if (tmp) merge(obj, tmp);
      tmp = i[_properties];
      if (tmp) assign(obj, tmp);
      tmp = i[_propertyDescriptors];
      if (tmp) defineProperties(obj, tmp);

      if (!inits || inits[_length] == 0) return obj;

      if (options === _undefined) options = {};
      for (i = 0; i < inits[_length];) {
        initializer = inits[i++];
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
    var1 = createFactory();

    var2 = descriptor[_staticDeepProperties];
    if (var2) {
      merge(var1, var2);
    }
    var2 = descriptor[_staticProperties];
    if (var2) {
      assign(var1, var2);
    }
    var2 = descriptor[_staticPropertyDescriptors];
    if (var2) {
      defineProperties(var1, var2);
    }

    var2 = isFunction(var1[_compose]) ? var1[_compose] : compose;
    var1[_compose] = function() {
      return var2.apply(this, arguments);
    };
    assign(var1[_compose], descriptor);

    return var1;
  }

  /**
   * Mutates the dstDescriptor by merging the srcComposable data into it.
   * @param {Descriptor} dstDescriptor The descriptor object to merge into.
   * @param {Composable} [srcComposable] The composable
   * (either descriptor or stamp) to merge data form.
   * @returns {Descriptor} Returns the dstDescriptor argument.
   */
  function mergeComposable(dstDescriptor, srcComposable) {
    var4 = (srcComposable && srcComposable[_compose]) || srcComposable;
    if (!isObject(var4)) {
      return dstDescriptor;
    }

    mergeAssign(dstDescriptor, var4, _methods);
    mergeAssign(dstDescriptor, var4, _properties);
    deepMergeAssign(dstDescriptor, var4, _deepProperties);
    mergeAssign(dstDescriptor, var4, _propertyDescriptors);
    mergeAssign(dstDescriptor, var4, _staticProperties);
    deepMergeAssign(dstDescriptor, var4, _staticDeepProperties);
    mergeAssign(dstDescriptor, var4, _staticPropertyDescriptors);
    mergeAssign(dstDescriptor, var4, _configuration);
    deepMergeAssign(dstDescriptor, var4, _deepConfiguration);
    concatAssignFunctions(dstDescriptor, var4[_initializers], _initializers);

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
      var4 = {};
      var3 = concat.apply([{}], arguments);
      var4[propName] = action.apply(_undefined, var3);
      var1 = this;

      return ((var1 && var1[_compose]) || _stampit).call(var1, var4);
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
    var i = 0, tmp1, composables = [], uniqueComposers, tmp2 = arguments, tmp3;
    for (; i < tmp2[_length]; i) {
      tmp1 = tmp2[i++];
      if (isObject(tmp1)) {
        composables.push(isStamp(tmp1) ? tmp1 : standardiseDescriptor(tmp1));
      }
    }

    // Calling the standard pure compose function here.
    tmp1 = compose.apply(this || baseStampit, composables);

    tmp2 = tmp1[_compose][_deepConfiguration];
    tmp3 = tmp2 && tmp2[_composers];
    if (tmp3 && tmp3[_length] > 0) {
      pushUniqueFuncs(tmp2[_composers] = uniqueComposers = [], tmp3);

      if (isStamp(this)) {
        composables.unshift(this);
      }
      for (i = 0; i < uniqueComposers[_length]; i) {
        tmp3 = uniqueComposers[i++]({stamp: tmp1, composables: composables});
        tmp1 = isStamp(tmp3) ? tmp3 : tmp1;
      }
    }

    return tmp1;
  };

  // Setting up the shortcut functions
  assign(_stampit, allUtilities);

  var4 = {};
  allUtilities.create = function() {
    return this.apply(_undefined, arguments);
  };
  allUtilities[_compose] = _stampit;
  var4[_staticProperties] = allUtilities;

  /**
   * Infected stamp. Used as a storage of the infection metadata
   * @type {Function}
   * @return {Stamp}
   */
  var baseStampit = compose(var4);

  _stampit[_compose] = _stampit.bind(); // bind to undefined

  if (typeof _undefined != typeof module) module.exports = _stampit; else self.stampit = _stampit;
}();

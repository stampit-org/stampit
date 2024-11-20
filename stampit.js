export default (function () {
  // This IIFE serves two needs:
  // 1. The minified JS file becomes 20% smaller.
  // 2. The minified GZIP file becomes 10% smaller.

  function getOwnPropertyKeys(obj) {
    return [
      ...Object.getOwnPropertyNames(obj),
      ...Object.getOwnPropertySymbols(obj),
    ];
  }

  /**
   * Unlike Object.assign(), our assign() copies symbols, getters and setters.
   * @param {Object} dst Must be an object. Otherwise throws.
   * @param {Object} [src] Can be falsy
   * @returns {Object} updated 'dst'
   */
  function assignOne(dst, src) {
    if (src) {
      // We need to copy regular props, symbols, getters and setters.
      for (const key of getOwnPropertyKeys(src)) {
        const desc = Object.getOwnPropertyDescriptor(src, key);
        // Make it rewritable because two stamps can have same named getter/setter
        Object.defineProperty(dst, key, desc);
      }
    }
    return dst;
  }

  function isFunction(obj) {
    return typeof obj === "function";
  }

  function isObject(obj) {
    return (obj && typeof obj === "object") || isFunction(obj);
  }

  function isPlainObject(value) {
    return (
      value && typeof value === "object" && value.__proto__ === Object.prototype
    );
  }

  /**
   * Unlike _.merge(), our merge() copies symbols, getters and setters.
   * The 'src' argument plays the command role.
   * The returned values is always of the same type as the 'src'.
   * @param {Array|Object|*} dst Destination
   * @param {Array|Object|*} src Source
   * @returns {Array|Object|*} The `dst` argument
   */
  function mergeOne(dst, src) {
    if (src === undefined) return dst;

    // According to specification arrays must be concatenated.
    // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
    if (Array.isArray(src)) return (Array.isArray(dst) ? dst : []).concat(src);

    // Now deal with non plain 'src' object. 'src' overrides 'dst'
    // Note that functions are also assigned! We do not deep merge functions.
    if (!isPlainObject(src)) return src;

    for (const key of getOwnPropertyKeys(src)) {
      const desc = Object.getOwnPropertyDescriptor(src, key);
      if (desc.hasOwnProperty("value")) {
        // is this a regular property?
        // Do not merge properties with the 'undefined' value.
        if (desc.value !== undefined) {
          // deep merge each property. Recursion!
          dst[key] = mergeOne(
            isPlainObject(dst[key]) || Array.isArray(src[key]) ? dst[key] : {},
            src[key],
          );
        }
      } else {
        // nope, it looks like a getter/setter
        // Make it rewritable because two stamps can have same named getter/setter
        Object.defineProperty(dst, key, desc);
      }
    }

    return dst;
  }

  const assign = (dst, ...args) => args.reduce(assignOne, dst);

  const merge = (dst, ...args) => args.reduce(mergeOne, dst);

  function extractUniqueFunctions(...args) {
    const funcs = new Set();
    for (const arg of args) {
      if (isFunction(arg)) {
        funcs.add(arg);
      } else if (Array.isArray(arg)) {
        for (const f of arg) {
          if (isFunction(f)) funcs.add(f);
        }
      }
    }
    return funcs.size ? Array.from(funcs) : undefined;
  }

  /**
   * Converts stampit extended descriptor to a standard one.
   * @param {Object|*} descr
   * methods
   * properties
   * props
   * initializers
   * init
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
    const out = {};

    out.methods = descr.methods || undefined;

    const p1 = descr.properties;
    const p2 = descr.props;
    out.properties = isObject(p1 || p2) ? assign({}, p2, p1) : undefined;

    out.initializers = extractUniqueFunctions(descr.init, descr.initializers);

    out.composers = extractUniqueFunctions(descr.composers);

    const dp1 = descr.deepProperties;
    const dp2 = descr.deepProps;
    out.deepProperties = isObject(dp1 || dp2) ? merge({}, dp2, dp1) : undefined;

    out.propertyDescriptors = descr.propertyDescriptors;

    const sp1 = descr.staticProperties;
    const sp2 = descr.statics;
    out.staticProperties = isObject(sp1 || sp2)
      ? assign({}, sp2, sp1)
      : undefined;

    const sdp1 = descr.staticDeepProperties;
    const sdp2 = descr.deepStatics;
    out.staticDeepProperties = isObject(sdp1 || sdp2)
      ? merge({}, sdp2, sdp1)
      : undefined;

    const spd1 = descr.staticPropertyDescriptors;
    const spd2 = descr.name && { name: { value: descr.name } };
    out.staticPropertyDescriptors = isObject(spd2 || spd1)
      ? assign({}, spd1, spd2)
      : undefined;

    const c1 = descr.configuration;
    const c2 = descr.conf;
    out.configuration = isObject(c1 || c2) ? assign({}, c2, c1) : undefined;

    const dc1 = descr.deepConfiguration;
    const dc2 = descr.deepConf;
    out.deepConfiguration = isObject(dc1 || dc2)
      ? merge({}, dc2, dc1)
      : undefined;

    return out;
  }

  /**
   * Creates new factory instance.
   * @returns {Function} The new factory function.
   */
  function createFactory() {
    return function Stamp(...args) {
      let options = args[0];
      const descriptor = Stamp.compose || {};

      // Next line was optimized for most JS VMs. Please, be careful here!
      // The instance of this stamp
      let instance = descriptor.methods
        ? Object.create(descriptor.methods)
        : {};

      if (descriptor.deepProperties) merge(instance, descriptor.deepProperties);
      if (descriptor.properties) assign(instance, descriptor.properties);
      if (descriptor.propertyDescriptors)
        Object.defineProperties(instance, descriptor.propertyDescriptors);

      const inits = descriptor.initializers;
      // No initializers?
      if (!Array.isArray(inits) || inits.length === 0) return instance;

      // The spec. says that the first argument to every initializer must be an
      // empty object if nothing else was given when a stamp was called: Stamp()
      if (options === undefined) options = {};

      for (let i = 0, initializer, returnedValue; i < inits.length; ) {
        initializer = inits[i++];
        if (isFunction(initializer)) {
          returnedValue = initializer.call(instance, options, {
            instance,
            stamp: Stamp,
            args,
          });
          instance = returnedValue === undefined ? instance : returnedValue;
        }
      }

      return instance;
    };
  }

  /**
   * Returns a new stamp given a descriptor and a compose function implementation.
   * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
   * @returns {Stamp} The new stamp
   */
  function createStamp(descriptor) {
    const factory = createFactory();

    const sdp = descriptor.staticDeepProperties;
    if (sdp) merge(factory, sdp);

    const sp = descriptor.staticProperties;
    if (sp) assign(factory, sp);

    const spd = descriptor.staticPropertyDescriptors;
    if (spd) Object.defineProperties(factory, spd);

    const c = isFunction(factory.compose) ? factory.compose : compose;
    assign(
      (factory.compose = function () {
        return c.apply(this, arguments);
      }),
      descriptor,
    );

    return factory;
  }

  /**
   * Mutates the dstDescriptor by merging the srcComposable data into it.
   * @param {Descriptor} dstDescriptor The descriptor object to merge into.
   * @param {Composable} [srcComposable] The composable
   * (either descriptor or stamp) to merge data form.
   * @returns {Descriptor} Returns the dstDescriptor argument.
   */
  function mergeComposable(dstDescriptor, srcComposable) {
    function mergeAssign(propName, deep) {
      if (!isObject(srcComposable[propName])) {
        return;
      }
      if (!isObject(dstDescriptor[propName])) {
        dstDescriptor[propName] = {};
      }
      (deep || assign)(dstDescriptor[propName], srcComposable[propName]);
    }

    function concatAssignFunctions(propName) {
      const funcs = extractUniqueFunctions(
        dstDescriptor[propName],
        srcComposable[propName],
      );
      if (funcs) dstDescriptor[propName] = funcs;
    }

    srcComposable = srcComposable?.compose || srcComposable;
    if (isObject(srcComposable)) {
      mergeAssign("methods");
      mergeAssign("properties");
      mergeAssign("deepProperties", merge);
      mergeAssign("propertyDescriptors");
      mergeAssign("staticProperties");
      mergeAssign("staticDeepProperties", merge);
      mergeAssign("staticPropertyDescriptors");
      mergeAssign("configuration");
      mergeAssign("deepConfiguration", merge);
      concatAssignFunctions("initializers");
      concatAssignFunctions("composers");
    }

    return dstDescriptor;
  }

  /**
   * Given the list of composables (stamp descriptors and stamps) returns
   * a new stamp (composable factory function).
   * @typedef {Function} Compose
   * Parameters:  {...Composable} The list of composables.
   * @returns {Stamp} A new stamp (aka composable factory function)
   */
  function compose(...args) {
    const descriptor = [this, ...args].reduce(mergeComposable, {});
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

  const allUtilities = {};

  allUtilities.methods = createUtilityFunction("methods", assign);

  allUtilities.properties = allUtilities.props = createUtilityFunction(
    "properties",
    assign,
  );

  allUtilities.initializers = allUtilities.init = createUtilityFunction(
    "initializers",
    extractUniqueFunctions,
  );

  allUtilities.composers = createUtilityFunction(
    "composers",
    extractUniqueFunctions,
  );

  allUtilities.deepProperties = allUtilities.deepProps = createUtilityFunction(
    "deepProperties",
    merge,
  );

  allUtilities.staticProperties = allUtilities.statics = createUtilityFunction(
    "staticProperties",
    assign,
  );

  allUtilities.staticDeepProperties = allUtilities.deepStatics =
    createUtilityFunction("staticDeepProperties", merge);

  allUtilities.configuration = allUtilities.conf = createUtilityFunction(
    "configuration",
    assign,
  );

  allUtilities.deepConfiguration = allUtilities.deepConf =
    createUtilityFunction("deepConfiguration", merge);

  allUtilities.propertyDescriptors = createUtilityFunction(
    "propertyDescriptors",
    assign,
  );

  allUtilities.staticPropertyDescriptors = createUtilityFunction(
    "staticPropertyDescriptors",
    assign,
  );

  function createUtilityFunction(propName, action) {
    return function (...args) {
      const obj = {
        [propName]: action({}, ...args),
      };

      return (this?.compose || stampit).call(this, obj);
    };
  }

  allUtilities.create = function (...args) {
    return this(...args);
  };

  /**
   * Infected compose
   * Parameters:  {...Composable} The list of composables.
   * @return {Stamp} The Stampit-flavoured stamp
   */
  const stampit = assign(function stampit(...args) {
    // "Composable" is both Descriptor and Stamp.
    const composables = [];
    for (const composable of args) {
      if (isObject(composable)) {
        composables.push(
          isStamp(composable) ? composable : standardiseDescriptor(composable),
        );
      }
    }

    // Calling the standard pure compose function here.
    let resultingStamp = compose.apply(this || baseStampit, composables);

    // The "this" context must be the first in the list.
    if (this) composables.unshift(this);
    const composers = resultingStamp.compose.composers;
    let composerResult;
    if (Array.isArray(composers)) {
      for (const composer of composers) {
        composerResult = composer({
          stamp: resultingStamp,
          composables,
        });
        resultingStamp = isStamp(composerResult)
          ? composerResult
          : resultingStamp;
      }
    }

    return resultingStamp;
  }, allUtilities); // Setting up the shortcut functions

  allUtilities.compose = stampit;

  /**
   * Infected stamp. Used as a storage of the infection metadata
   * @type {Function}
   * @return {Stamp}
   */
  let baseStampit = compose({ staticProperties: allUtilities });

  stampit.compose = stampit.bind(); // bind to undefined
  stampit.version = "VERSION"; // This will be replaced at the build time with the proper version taken from the package.json

  return stampit;
})();

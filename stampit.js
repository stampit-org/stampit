export default (function () {
  // This IIFE serves two needs:
  // 1. The minified JS file becomes 20% smaller.
  // 2. The minified GZIP file becomes 10% smaller.

  function getOwnPropertyKeys(obj) {
    return [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];
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
    return value && typeof value === "object" && value.__proto__ === Object.prototype;
  }

  /**
   * Returns true if argument is a stamp.
   * @param {*} obj Any object
   * @returns {Boolean} True is the obj is a stamp
   */
  function isStamp(obj) {
    return isFunction(obj) && isFunction(obj.compose);
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
    // Create a new array instance. Overrides the 'dst'.
    if (Array.isArray(src)) {
      if (Array.isArray(dst)) return [...dst, ...src];
      return [...src]; // ignore the 'dst'
    }
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
          dst[key] = mergeOne(isPlainObject(dst[key]) || Array.isArray(src[key]) ? dst[key] : {}, src[key]);
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
      if (Array.isArray(arg)) {
        for (const f of arg) {
          if (isFunction(f)) funcs.add(f);
        }
      } else if (isFunction(arg)) {
        funcs.add(arg);
      }
    }
    return funcs.size ? Array.from(funcs) : undefined;
  }

  /**
   * Creates new factory instance.
   * @returns {Function} The new factory function.
   */
  function createEmptyStamp() {
    return function Stamp(...args) {
      let options = args[0];
      const descriptor = Stamp.compose || {};

      // Next line was optimized for most JS VMs. Please, be careful here!
      // The instance of this stamp
      let instance = descriptor.methods ? Object.create(descriptor.methods) : {};

      if (descriptor.deepProperties) merge(instance, descriptor.deepProperties);
      if (descriptor.properties) assign(instance, descriptor.properties);
      if (descriptor.propertyDescriptors) Object.defineProperties(instance, descriptor.propertyDescriptors);

      const inits = descriptor.initializers;
      // No initializers?
      if (!Array.isArray(inits) || inits.length === 0) return instance;

      // The spec. says that the first argument to every initializer must be an
      // empty object if nothing else was given when a stamp was called: Stamp()
      if (options === undefined) options = {};

      for (let i = 0, initializer, returnedValue; i < inits.length; ) {
        initializer = inits[i++];
        if (isFunction(initializer)) {
          returnedValue = initializer.call(instance, options, { instance, stamp: Stamp, args });
          instance = returnedValue === undefined ? instance : returnedValue;
        }
      }

      return instance;
    };
  }

  /**
   * Mutates the dstDescriptor by merging the srcComposable data into it.
   * @param {Descriptor} dstDescriptor The descriptor object to merge into.
   * @param {Composable} [srcComposable] The composable
   * (either descriptor or stamp) to merge data form.
   * @returns {Descriptor} Returns the dstDescriptor argument.
   */
  function mergeComposable(dstDescriptor, srcComposable) {
    function mergeAssign(propName, action) {
      if (!isObject(srcComposable[propName])) {
        return;
      }
      if (!isObject(dstDescriptor[propName])) {
        dstDescriptor[propName] = {};
      }
      action(dstDescriptor[propName], srcComposable[propName]);
    }

    function concatAssignFunctions(propName) {
      const funcs = extractUniqueFunctions(dstDescriptor[propName], srcComposable[propName]);
      if (funcs) dstDescriptor[propName] = funcs;
    }

    srcComposable = srcComposable?.compose || srcComposable;
    if (isObject(srcComposable)) {
      mergeAssign("methods", assign);
      mergeAssign("properties", assign);
      mergeAssign("deepProperties", merge);
      mergeAssign("propertyDescriptors", assign);
      mergeAssign("staticProperties", assign);
      mergeAssign("staticDeepProperties", merge);
      mergeAssign("staticPropertyDescriptors", assign);
      mergeAssign("configuration", assign);
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
    // "Composable" is both Descriptor and Stamp.
    // The "this" context must be the first in the list.
    const composables = [this, ...args].filter(isObject);

    let stamp = createEmptyStamp();
    const descriptor = composables.reduce(mergeComposable, {});

    merge(stamp, descriptor.staticDeepProperties);
    assign(stamp, descriptor.staticProperties);
    if (descriptor.staticPropertyDescriptors) Object.defineProperties(stamp, descriptor.staticPropertyDescriptors);

    const c = isFunction(stamp.compose) ? stamp.compose : compose;
    stamp.compose = function (...args) {
      return c(this, ...args);
    };

    assign(stamp.compose, descriptor);

    const composers = stamp.compose.composers;
    if (Array.isArray(composers)) {
      for (const composer of composers) {
        const composerResult = composer({ stamp: stamp, composables });
        stamp = isStamp(composerResult) ? composerResult : stamp;
      }
    }

    return stamp;
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

  /////////////
  ///////////// NOTE! Everything above is the compose(). The below is the stampit(). /////////////
  /////////////

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
    // Avoid processing non-objects. Also, do not process stamps because they are already standard.
    if (!isObject(descr) || isStamp(descr)) return descr;

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
    out.staticProperties = isObject(sp1 || sp2) ? assign({}, sp2, sp1) : undefined;

    const sdp1 = descr.staticDeepProperties;
    const sdp2 = descr.deepStatics;
    out.staticDeepProperties = isObject(sdp1 || sdp2) ? merge({}, sdp2, sdp1) : undefined;

    const spd1 = descr.staticPropertyDescriptors;
    const spd2 = descr.name && { name: { value: descr.name } };
    out.staticPropertyDescriptors = isObject(spd2 || spd1) ? assign({}, spd1, spd2) : undefined;

    const c1 = descr.configuration;
    const c2 = descr.conf;
    out.configuration = isObject(c1 || c2) ? assign({}, c2, c1) : undefined;

    const dc1 = descr.deepConfiguration;
    const dc2 = descr.deepConf;
    out.deepConfiguration = isObject(dc1 || dc2) ? merge({}, dc2, dc1) : undefined;

    return out;
  }

  const allUtilities = {
    methods(...args) {
      const descriptor = { methods: assign({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    properties(...args) {
      const descriptor = { properties: assign({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    initializers(...args) {
      const descriptor = { initializers: extractUniqueFunctions(...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    composers(...args) {
      const descriptor = { composers: extractUniqueFunctions(...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    deepProperties(...args) {
      const descriptor = { deepProperties: merge({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    staticProperties(...args) {
      const descriptor = { staticProperties: assign({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    staticDeepProperties(...args) {
      const descriptor = { staticDeepProperties: merge({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    configuration(...args) {
      const descriptor = { configuration: assign({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    deepConfiguration(...args) {
      const descriptor = { deepConfiguration: merge({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    propertyDescriptors(...args) {
      const descriptor = { propertyDescriptors: assign({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    staticPropertyDescriptors(...args) {
      const descriptor = { staticPropertyDescriptors: assign({}, ...args) };
      return this ? this.compose(descriptor) : stampit(descriptor);
    },
    create(...args) {
      return this(...args);
    },
  };
  allUtilities.props = allUtilities.properties;
  allUtilities.init = allUtilities.initializers;
  allUtilities.deepProps = allUtilities.deepProperties;
  allUtilities.statics = allUtilities.staticProperties;
  allUtilities.deepStatics = allUtilities.staticDeepProperties;
  allUtilities.conf = allUtilities.configuration;
  allUtilities.deepConf = allUtilities.deepConfiguration;

  allUtilities.compose = stampit; // infecting!

  /**
   * Infected compose
   * Parameters:  {...Composable} The list of composables.
   * @return {Stamp} The Stampit-flavoured stamp
   */
  function stampit(...args) {
    return compose(this, { staticProperties: allUtilities }, ...args.map(standardiseDescriptor));
  }

  assign(stampit, allUtilities); // Setting up the shortcut functions

  stampit.compose = stampit.bind(); // bind to undefined
  stampit.version = "VERSION"; // This will be replaced at the build time with the proper version taken from the package.json

  return stampit;
})();

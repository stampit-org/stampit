export default (function () {
  // This IIFE serves two needs:
  // 1. The minified JS file becomes 20% smaller.
  // 2. The minified GZIP file becomes 10% smaller.
  // There is nothing to treeshake in this file.

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
      return [...src]; // ignore the 'dst', clone the src
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
    const funcs = new Set(args.flat().filter(isFunction));
    return funcs.size ? [...funcs] : undefined;
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

      mergeOne(instance, descriptor.deepProperties);
      assignOne(instance, descriptor.properties);
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
      mergeAssign("methods", assignOne);
      mergeAssign("properties", assignOne);
      mergeAssign("deepProperties", mergeOne);
      mergeAssign("propertyDescriptors", assignOne);
      mergeAssign("staticProperties", assignOne);
      mergeAssign("staticDeepProperties", mergeOne);
      mergeAssign("staticPropertyDescriptors", assignOne);
      mergeAssign("configuration", assignOne);
      mergeAssign("deepConfiguration", mergeOne);
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

    mergeOne(stamp, descriptor.staticDeepProperties);
    assignOne(stamp, descriptor.staticProperties);
    if (descriptor.staticPropertyDescriptors) Object.defineProperties(stamp, descriptor.staticPropertyDescriptors);

    const c = isFunction(stamp.compose) ? stamp.compose : compose; // either use the Infected Compose or the standard one.
    stamp.compose = function (...args) {
      return c(this, ...args);
    };

    assignOne(stamp.compose, descriptor);

    const composers = descriptor.composers;
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

  const additionalStaticProperties = {
    methods(...args) {
      return this.compose({ methods: assign({}, ...args) });
    },
    properties(...args) {
      return this.compose({ properties: assign({}, ...args) });
    },
    initializers(...args) {
      return this.compose({ initializers: extractUniqueFunctions(...args) });
    },
    composers(...args) {
      return this.compose({ composers: extractUniqueFunctions(...args) });
    },
    deepProperties(...args) {
      return this.compose({ deepProperties: merge({}, ...args) });
    },
    staticProperties(...args) {
      return this.compose({ staticProperties: assign({}, ...args) });
    },
    staticDeepProperties(...args) {
      return this.compose({ staticDeepProperties: merge({}, ...args) });
    },
    configuration(...args) {
      return this.compose({ configuration: assign({}, ...args) });
    },
    deepConfiguration(...args) {
      return this.compose({ deepConfiguration: merge({}, ...args) });
    },
    propertyDescriptors(...args) {
      return this.compose({ propertyDescriptors: assign({}, ...args) });
    },
    staticPropertyDescriptors(...args) {
      return this.compose({ staticPropertyDescriptors: assign({}, ...args) });
    },
    create(...args) {
      return this(...args);
    },
    compose: stampit, // infecting!
  };
  additionalStaticProperties.props = additionalStaticProperties.properties;
  additionalStaticProperties.init = additionalStaticProperties.initializers;
  additionalStaticProperties.deepProps = additionalStaticProperties.deepProperties;
  additionalStaticProperties.statics = additionalStaticProperties.staticProperties;
  additionalStaticProperties.deepStatics = additionalStaticProperties.staticDeepProperties;
  additionalStaticProperties.conf = additionalStaticProperties.configuration;
  additionalStaticProperties.deepConf = additionalStaticProperties.deepConfiguration;

  // Add one more method to the statics. Most importantly - we have to clone the `additionalStaticProperties` object as it will be mutated below.
  const staticProperties = {
    ...additionalStaticProperties,
  };

  /**
   * Infected compose
   * Parameters:  {...Composable} The list of composables.
   * @return {Stamp} The Stampit-flavoured stamp
   */
  function stampit(...args) {
    return compose(this, { staticProperties: additionalStaticProperties }, ...args.map(standardiseDescriptor));
  }

  stampit.version = "VERSION"; // This will be replaced at the build time with the proper version taken from the package.json

  return stampit;
})();

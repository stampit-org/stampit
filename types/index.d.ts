// Type definitions for stampit 4.3
// Project: https://github.com/stampit-org/stampit, https://stampit.js.org
// Definitions by: Vasyl Boroviak <https://github.com/koresar>
//                 Harris Lummis <https://github.com/lummish>
//                 PopGoesTheWza <https://github.com/popgoesthewza>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference path="specification.d.ts" />

/**
 * Return a factory (a.k.a. Stamp) function that will produce new objects using the prototypes that are passed in or composed.
 * @param options Stampit options object containing methods,
 * init, props, statics, configurations, and property descriptors.
 */
declare function stampit<I = any>(...composables: Array<stampit.StampitComposable<I>>): stampit.Stamp<I>;

declare namespace stampit {
    // TODO: Add description
    const version: string;
    /** The stamp Descriptor */
    interface Descriptor<I, F extends Specification.Stamp<any> = Specification.Stamp<I>> extends Specification.Descriptor<I, F> {
        /** Create a new stamp based on this descriptor */
        // ? is this function signature trully needed?
        (...composables: Array<StampitComposable<I>>): Stamp<I>;
    }

    /** Any composable object (stamp or descriptor) */
    // ! should have been StampitComposable
    // type Composable<I> = Stamp<I> | Descriptor<I>;

    // TODO: Add description
    // ? shouldn't stampit.Option be stampit.(Extended)Descriptor really?
    interface Options<I, F extends Specification.Stamp<any> = Specification.Stamp<I>> extends Omit<Specification.Descriptor<I, F>, 'initializers'> {
        /** Properties which will shallowly copied into any future created instance. */
        props?: Specification.PropertyMap;
        /** Deeply merged properties of object instances */
        deepProps?: Specification.PropertyMap;
        /** Properties which will be mixed to the new and any other stamp which this stamp will be composed with. */
        statics?: Specification.PropertyMap & ThisType<F>;
        /** Deeply merged properties of Stamps */
        deepStatics?: Specification.PropertyMap & ThisType<F>;
        /** Initialization function(s) which will be called per each newly created instance. */
        init?: Specification.Initializer<I> | Array<Specification.Initializer<I>>;
        /** Initialization function(s) which will be called per each newly created instance. */
        initializers?: Specification.Initializer<I> | Array<Specification.Initializer<I>>;
        /** A configuration object to be shallowly assigned to Stamps */
        conf?: Specification.PropertyMap & ThisType<F>;
        /** A configuration object to be deeply merged to Stamps */
        deepConf?: Specification.PropertyMap & ThisType<F>;
        // TODO: Add description
        name: string;
    }

    /** Stampit Composable for main stampit() function */
    // TODO: simplify after factorizing interfaces
    type StampitComposable<I, U = Specification.StampType<I>> = Specification.Composable<I, U> | Stamp<I> | Descriptor<U> | Options<U>;

    /**
     * A factory function that will produce new objects using the
     * prototypes that are passed in or composed.
     */
    interface Stamp<I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>> extends Specification.Stamp<I> {
        /**
         * Just like calling stamp(), stamp.create() invokes the stamp and returns a new instance.
         * @param state Properties you wish to set on the new objects.
         * @param encloseArgs The remaining arguments are passed to all `.init()` functions.
         * **WARNING** Avoid using two different `.init()` functions that expect different arguments.
         * `.init()` functions that take arguments should not be considered safe to compose
         * with other `.init()` functions that also take arguments. Taking arguments with
         * an `.init()` function is an anti-pattern that should be avoided, when possible.
         * @return A new object composed of the Stamps and prototypes provided.
         */
        create(state?: Specification.PropertyMap, ...encloseArgs: Array<any>): I;

        /**
         * Stamp metadata/composer function
         */
        compose: Descriptor<I> & Specification.ComposeMethod<I>;

        /**
         * Add methods to the methods prototype.  Creates and returns new Stamp. Chainable.
         * @param methods Object(s) containing map of method names and bodies for delegation.
         * @return A new Stamp.
         */
        methods(...methods: Array<{}>): Stamp<I>;

        /**
         * Take a variable number of objects and shallow assign them to any future
         * created instance of the Stamp. Creates and returns new Stamp. Chainable.
         * @param objects Object(s) to shallow assign for each new object.
         * @return A new Stamp.
         */
        props(...objects: Array<{}>): Stamp<I>;

        /**
         * Take a variable number of objects and shallow assign them to any future
         * created instance of the Stamp. Creates and returns new Stamp. Chainable.
         * @param objects Object(s) to shallow assign for each new object.
         * @return A new Stamp.
         */
        properties(...objects: Array<{}>): Stamp<I>;

        /**
         * Take a variable number of objects and deeply merge them to any future
         * created instance of the Stamp. Creates and returns a new Stamp.
         * Chainable.
         * @param deepObjects The object(s) to deeply merge for each new object
         * @returns A new Stamp
         */
        deepProps(...deepObjects: Array<{}>): Stamp<I>;

        /**
         * Take a variable number of objects and deeply merge them to any future
         * created instance of the Stamp. Creates and returns a new Stamp.
         * Chainable.
         * @param deepObjects The object(s) to deeply merge for each new object
         * @returns A new Stamp
         */
        deepProperties(...deepObjects: Array<{}>): Stamp<I>;

        /**
         * Take in a variable number of functions and add them to the init
         * prototype as initializers.
         * @param functions Initializer functions used to create private data and
         * privileged methods
         * @returns A new stamp
         */
        init<I = any>(...functions: Array<Specification.Initializer<I>>): Stamp<I>;
        init<I = any>(functions: Array<Specification.Initializer<I>>): Stamp<I>;

        /**
         * Take in a variable number of functions and add them to the init
         * prototype as initializers.
         * @param functions Initializer functions used to create private data and
         * privileged methods
         * @returns A new stamp
         */
        initializers<I>(...functions: Array<Specification.Initializer<I>>): Stamp<I>;

        /**
         * Take in a variable number of functions and add them to the init
         * prototype as initializers.
         * @param functions Initializer functions used to create private data and
         * privileged methods
         * @returns A new stamp
         */
        initializers<I>(functions: Array<Specification.Initializer<I>>): Stamp<I>;

        /**
         * Take n objects and add them to a new stamp and any future stamp it composes with.
         * Creates and returns new Stamp. Chainable.
         * @param statics Object(s) containing map of property names and values to mixin into each new stamp.
         * @return A new Stamp.
         */
        statics(...statics: Array<{}>): Stamp<I>;

        /**
         * Take n objects and add them to a new stamp and any future stamp it composes with.
         * Creates and returns new Stamp. Chainable.
         * @param statics Object(s) containing map of property names and values to mixin into each new stamp.
         * @return A new Stamp.
         */
        staticProperties(...statics: Array<{}>): Stamp<I>;

        /**
         * Deeply merge a variable number of objects and add them to a new stamp and
         * any future stamp it composes. Creates and returns a new Stamp. Chainable.
         * @param deepStatics The object(s) containing static properties to be
         * merged
         * @returns A new stamp
         */
        deepStatics(...deepStatics: Array<{}>): Stamp<I>;

        /**
         * Deeply merge a variable number of objects and add them to a new stamp and
         * any future stamp it composes. Creates and returns a new Stamp. Chainable.
         * @param deepStatics The object(s) containing static properties to be
         * merged
         * @returns A new stamp
         */
        staticDeepProperties(...deepStatics: Array<{}>): Stamp<I>;

        /**
         * Shallowly assign properties of Stamp arbitrary metadata and add them to
         * a new stamp and any future Stamp it composes. Creates and returns a new
         * Stamp. Chainable.
         * @param confs The object(s) containing metadata properties
         * @returns A new Stamp
         */
        conf(...confs: Array<{}>): Stamp<I>;

        /**
         * Shallowly assign properties of Stamp arbitrary metadata and add them to
         * a new stamp and any future Stamp it composes. Creates and returns a new
         * Stamp. Chainable.
         * @param confs The object(s) containing metadata properties
         * @returns A new Stamp
         */
        configuration(...confs: Array<{}>): Stamp<I>;

        /**
         * Deeply merge properties of Stamp arbitrary metadata and add them to a new
         * Stamp and any future Stamp it composes. Creates and returns a new Stamp.
         * Chainable.
         * @param deepConfs The object(s) containing metadata properties
         * @returns A new Stamp
         */
        deepConf(...deepConfs: Array<{}>): Stamp<I>;

        /**
         * Deeply merge properties of Stamp arbitrary metadata and add them to a new
         * Stamp and any future Stamp it composes. Creates and returns a new Stamp.
         * Chainable.
         * @param deepConfs The object(s) containing metadata properties
         * @returns A new Stamp
         */
        deepConfiguration(...deepConfs: Array<{}>): Stamp<I>;

        /**
         * Apply ES5 property descriptors to object instances created by the new
         * Stamp returned by the function and any future Stamp it composes. Creates
         * and returns a new stamp. Chainable.
         * @param descriptors
         * @returns A new Stamp
         */
        propertyDescriptors(...descriptors: Array<{}>): Stamp<I>;

        /**
         * Apply ES5 property descriptors to a Stamp and any future Stamp it
         * composes. Creates and returns a new stamp. Chainable.
         * @param descriptors
         * @returns A new Stamp
         */
        staticPropertyDescriptors(...descriptors: Array<{}>): Stamp<I>;
    }
    /**
     * A shortcut methods for stampit().methods()
     * @param methods Object(s) containing map of method names and bodies for delegation.
     * @return A new Stamp.
     */
    function methods
    <I = any>
    (...methods: Array<{}>): Stamp<I>;
    function methods
        <I = any>
        (...methods: Array<Specification.MethodMap>): Stamp<I>;

    /**
     * A shortcut method for stampit().props()
     * @param objects Object(s) to shallow assign for each new object.
     * @return A new Stamp.
     */
    function props
        <I = any>
        (...objects: Array<Specification.PropertyMap>): Stamp<I>;

    /**
     * A shortcut method for stampit().properties()
     * @param objects Object(s) to shallow assign for each new object.
     * @return A new Stamp.
     */
    function properties
        <I = any>
        (...objects: Array<Specification.PropertyMap>): Stamp<I>;

    /**
     * A shortcut method for stampit().deepProps()
     * @param deepObjects The object(s) to deeply merge for each new object
     * @returns A new Stamp
     */
    function deepProps
        <I = any>
        (...deepObjects: Array<Specification.PropertyMap>): Stamp<I>;

    /**
     * A shortcut method for stampit().deepProperties()
     * @param deepObjects The object(s) to deeply merge for each new object
     * @returns A new Stamp
     */
    function deepProperties
        <I = any>
        (...deepObjects: Array<Specification.PropertyMap>): Stamp<I>;

    /**
     * A shortcut method for stampit().init()
     * @param functions Initializer functions used to create private data and
     * privileged methods
     * @returns A new stamp
     */
    function init
        <I = any>
        (...functions: Array<Specification.Initializer<I>>): Stamp<I>;
    function init
        <I = any>
        (...functions: Array<Specification.Initializer<I>>): Stamp<I>;

    /**
     * A shortcut method for stampit().initializers()
     * @param functions Initializer functions used to create private data and privileged methods
     * @returns A new stamp
     */
    function initializers
        <I = any>
        (...functions: Array<Specification.Initializer<I>>): Stamp<I>;
    function initializers
        <I = any>
        (...functions: Array<Specification.Initializer<I>>): Stamp<I>;

    /**
     * A shortcut method for stampit().statics()
     * @param statics Object(s) containing map of property names and values to mixin into each new stamp.
     * @return A new Stamp.
     */
    function staticProperties
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...statics: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().staticProperties()
     * @param statics Object(s) containing map of property names and values to mixin into each new stamp.
     * @return A new Stamp.
     */
    function staticProperties
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...statics: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().deepStatics()
     * @param deepStatics The object(s) containing static properties to be merged
     * @returns A new stamp
     */
    function deepStatics
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...deepStatics: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().staticDeepProperties()
     * @param deepStatics The object(s) containing static properties to be merged
     * @returns A new stamp
     */
    function staticDeepProperties
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...deepStatics: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().conf()
     * @param confs The object(s) containing metadata properties
     * @returns A new Stamp
     */
    function conf
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...deepConfs: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().configuration()
     * @param confs The object(s) containing metadata properties
     * @returns A new Stamp
     */
    function configuration
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...deepConfs: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().deepConf()
     * @param deepConfs The object(s) containing metadata properties
     * @returns A new Stamp
     */
    function deepConf
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...deepConfs: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().deepConfiguration()
     * @param deepConfs The object(s) containing metadata properties
     * @returns A new Stamp
     */
    function deepConfiguration
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...deepConfs: Array<Specification.PropertyMap> & ThisType<F>): Stamp<I>;

    /**
     * A shortcut method for stampit().propertyDescriptors()
     * @param descriptors
     * @returns A new Stamp
     */
    function propertyDescriptors
        <I = any>
        (...descriptors: Array<PropertyDescriptorMap>): Stamp<I>;

    /**
     * A shortcut method for stampit().staticPropertyDescriptors()
     * @param descriptors
     * @returns A new Stamp
     */
    function staticPropertyDescriptors
        <I = any, F extends Specification.Stamp<any> = Specification.Stamp<I>>
        (...descriptors: Array<PropertyDescriptorMap> & ThisType<F>): Stamp<I>;

    /**
     * Take two or more Composables and combine them to produce a new Stamp.
     * Combining overrides properties with last-in priority.
     * @param composables Composable objects used to create the stamp.
     * @return A new Stamp made of all the given composables.
     */
    function compose
        <I = any>
        (...composables: Array<StampitComposable<I>>): Stamp<I>;
}

// export = stampit;

declare module 'stampit' {
    export = stampit;
}

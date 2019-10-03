/** Stamp Specification v1.6 */
declare namespace Specification {
  /** Base type for `properties` */
  type PropertyMap = { [s: string]: any; };

  /** Base type for `methods` */
  type MethodMap = { [s: string]: (...args: Array<any>) => any; };

  /** Extract the instance type from Factory, Descriptor (or Instance) */
  type StampType<I> = I extends Factory<infer I> ? I
                    : I extends Descriptor<infer I> ? I
                    : I extends Instance ? I
                    : never;

  /** A composable object (`stamp` factory or Descriptor) */
  type Composable<I, U = StampType<I>> = Factory<U> | Descriptor<U>;

  /** Base `stamp` instance */
  type Instance = { [s: string]: any; };

  /**
   * A factory function that will produce new objects using the
   * prototypes that are passed in or composed.
   */
  // TODO: interface Factory<I, F extends Factory<any> = Factory<I>>
  interface Factory<I> {
      /**
       * Invokes the `stamp` and returns a new object instance.
       * @param options Properties you wish to set on the new object.
       * @param args The remaining arguments are passed to all `.init()` functions.
       * **WARNING** Avoid using two different `.init()` functions that expect different arguments.
       * `.init()` functions that take arguments should not be considered safe to compose
       * with other `.init()` functions that also take arguments. Taking arguments with
       * an `.init()` function is an anti-pattern that should be avoided, when possible.
       * @return A new object composed of the Stamps and prototypes provided.
       */
      (options?: PropertyMap, ...args: Array<any>): I;

      /** Stamp metadata/composer function */
      compose: ComposeMethod<I> & Descriptor<I>;
  }

  /** Create a new stamp based on this descriptor */
  interface ComposeMethod<I> {
      // TODO: investigate how to support extended Factory interfaces
      <U>(...args: Array<U>): Factory<I & StampType<U>>;
  }

  /** The stamp Descriptor */
  interface Descriptor<I, F extends Factory<any> = Factory<I>> {
      /** A hash containing methods (functions) of any future created instance. */
      methods?: MethodMap;
      /** Properties which will shallowly copied into any future created instance. */
      properties?: PropertyMap;
      /** Deeply merged properties of object instances */
      deepProperties?: PropertyMap;
      /** ES5 Property Descriptors applied to object instances */
      propertyDescriptors?: PropertyDescriptorMap;
      /** Properties which will be mixed to the new and any other stamp which this stamp will be composed with. */
      staticProperties?: PropertyMap & ThisType<F>;
      /** Deeply merged properties of Stamps */
      staticDeepProperties?: PropertyMap & ThisType<F>;
      /** ES5 Property Descriptors applied to Stamps */
      staticPropertyDescriptors?: PropertyDescriptorMap & ThisType<F>;
      /** Initialization function(s) which will be called per each newly created instance. */
      initializers?: Array<Initializer<I>>;
      /** Callback functions to execute each time a composition occurs */
      composers?: Array<Composer<I>>;
      /** A configuration object to be shallowly assigned to Stamps */
      configuration?: PropertyMap & ThisType<F>;
      /** A configuration object to be deeply merged to Stamps */
      deepConfiguration?: PropertyMap & ThisType<F>;
  }

  /** Function used as .init() argument. */
  interface Initializer<I> {
      // TODO: check that the value of `this` is correct
      (/*this: I, */options: PropertyMap, context?: InitializerContext<I>): any;
  }

  /** The .init() function argument. */
  interface InitializerContext<I> {
      /** The object instance being produced by the stamp. If the initializer returns a value other than `undefined`, it replaces the instance. */
      instance?: I;
      /** A reference to the `stamp` producing the instance. */
      // TODO: investigate how to support extended Factory interfaces
      stamp?: Factory<I>;
      /** An array of the arguments passed into the stamp, including the `options` argument. */
      // ! above description from the specification is obscure
      args?: Array<any>;
  }

  /** Composer function */
  interface Composer<I> {
      (parmeters: ComposerParameters<I>): Factory<I>;
  }

  interface ComposerParameters<I> {
      /** The result of the composables composition. */
      // TODO: investigate how to support extended Factory interfaces
      stamp: Factory<I>;
      /** The list of composables the `stamp` was just composed of. */
      composables: Array<Composable<I>>;
  }
}

/** Stamp Specification v1.6 */
declare namespace Specification {
  /** Base type for all `properties`-like metadata. */
  type PropertyMap = { [s: string]: any; };

  /** Base type for all `methods`-like metadata. */
  type MethodMap = { [s: string]: (...args: Array<any>) => any; };

  /**
   * Extract the type of the object defined by `Stamp`, `Descriptor` (or `POJO`) types.
   * @param {type} I Type definition to extract the object type from.
   * @returns {type} The object type.
   */
  type StampType<I> = I extends Stamp<infer I> ? I
                    : I extends Descriptor<infer I> ? I
                    : I extends POJO ? I
                    : never;

  /**
   * A composable object (either a `Stamp` or a `Descriptor`)
   * @param {type} I The object type defined by `Stamp` or `Descriptor` types.
   * @returns {type} The composable type.
   */
  // TODO: support for extended `Stamp` interfaces
  type Composable<I, U = StampType<I>> = Stamp<U> | Descriptor<U>;

  /** A plain old JavaScript object created from a `Stamp`. */
  type POJO = { [s: string]: any; };

  /**
   * A factory function to create plain object instances. It also has a `.compose()` method which is a copy of the `ComposeMethod` function.
   * @param {type} I The object type produced by the `Stamp`.
   * @returns {I} The object produced by the `Stamp`.
   */
  // TODO: support for extending a `Stamp` factory: interface Stamp<I, F extends Stamp<any> = Stamp<I>>
  interface Stamp<I> {
      /**
       * @param {type} I The object type produced by the `Stamp`.
       * @param {PropertyMap} options (optional) Properties to set on the new object instance.
       * @param {Array<any>} args Remaining arguments passed to all `.initializers` functions.
       * **WARNING** Avoid using different `.initializers` functions that expect different arguments.
       * `.initializers` functions that take arguments should not be considered safe to compose
       * with other `.initializers` functions that also take arguments. Taking arguments with
       * an `.initializers` function is an anti-pattern that should be avoided, when possible.
       * @returns {I} The object produced by the `Stamp`.
       */
      (options?: PropertyMap, ...args: Array<any>): I;

      /** Stamp `ComposeMethod` function and `Descriptor` metadata. */
      compose: ComposeMethod<I> & Descriptor<I>;
  }

  /**
   * A function which creates a new `Stamp`s from a list of `Composable`s.
   * @param {type} U The object type produced by the new `Stamp`.
   * @param {Array<Composable>} args A list of `Composable`s.
   * @returns {Stamp} The new `Stamp`.
   */
  interface ComposeMethod<I> {
      // TODO: support for extended `Stamp` interfaces
      // TODO: compose final object type from StampType<args> & StampType<U>
      // ? is the `Descriptor` from the source `Stamp` also used in the composition
      <U>(...args: Array<Composable<any>>): Stamp<StampType<U>>;
  }

  /**
   * A `Stamp`'s metadata
   * @param {type} I The object type produced by the `Stamp`.
   * @param {type} F (optional) The extended `Stamp` type.
   */
  interface Descriptor<I, F extends Stamp<any> = Stamp<I>> {
      /** A set of methods that will be added to the object's delegate prototype. */
      methods?: MethodMap;
      /** A set of properties that will be added to new object instances by assignment. */
      properties?: PropertyMap;
      /** A set of properties that will be added to new object instances by deep property merge. */
      deepProperties?: PropertyMap;
      /** A set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviors. */
      propertyDescriptors?: PropertyDescriptorMap;
      /** A set of static properties that will be copied by assignment to the `Stamp`. */
      staticProperties?: PropertyMap & ThisType<F>;
      /** A set of static properties that will be added to the `Stamp` by deep property merge. */
      staticDeepProperties?: PropertyMap & ThisType<F>;
      /** A set of object property descriptors (`PropertyDescriptor`) to apply to the `Stamp`. */
      staticPropertyDescriptors?: PropertyDescriptorMap & ThisType<F>;
      /** An array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
      initializers?: Array<Initializer<I>>;
      /** An array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
      composers?: Array<Composer<I>>;
      /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
      configuration?: PropertyMap & ThisType<F>;
      /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
      deepConfiguration?: PropertyMap & ThisType<F>;
  }

  /**
   * A function used as `.initializers` argument.
   * @param {type} I The object type produced by the `Stamp`.
   * @param {PropertyMap} options The `options` argument passed into the stamp, containing properties that may be used by initializers.
   * (Cf. the `Descriptor` attributes `configuration` and `deepConfiguration`)
   * @param {InitializerContext} context (optional) The context of current `.initializers` function.
   * @returns {I} The object produced by the `Stamp`.
   */
  interface Initializer<I> {
      // TODO: check that the value of `this` is correct
      (/*this: I, */options?: PropertyMap, context?: InitializerContext<I>): I;
  }

  /**
   * The `Initializer` function context.
   * @param {type} I The object type produced by the `Stamp`.
   * @param {I} instance (optional) The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance.
   * @param {Stamp<I>} stamp (optional) A reference to the `Stamp` producing the instance.
   * @param {Array<any>} args (optional) An array of the arguments passed into the `Stamp`, including the options argument.
   */
  interface InitializerContext<I> {
      /** The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance. */
      instance?: I;
      /** A reference to the `Stamp` producing the instance. */
      // TODO: investigate how to support extended Stamp interfaces
      stamp?: Stamp<I>;
      /** An array of the arguments passed into the `Stamp`, including the options argument. */
      // ! above description from the specification is obscure
      args?: Array<any>;
  }

  /**
   * A function used as `.composers` argument.
   * @param {type} I The object type produced by the new `Stamp`.
   * @param {ComposerParameters} parameters The parameters recieved by the current `.composers` function.
   * @returns {Stamp<I>} The new `Stamp`.
   */
  interface Composer<I> {
      (parameters: ComposerParameters<I>): Stamp<I>;
  }

  /**
   * The parameters recieved by the current `.composers` function.
   * @param {type} I The object type produced by the new `Stamp`.
   * @param {Stamp<I>} stamp The result of the `Composable`s composition.
   * @param {Array<Composable>} composables The list of composables the `Stamp` was just composed of.
   */
  interface ComposerParameters<I> {
      /** The result of the `Composable`s composition. */
      // TODO: investigate how to support extended Stamp interfaces
      stamp: Stamp<I>;
      /** The list of composables the `Stamp` was just composed of. */
      // TODO: better typing of Composable
      composables: Array<Composable<any>>;
  }
}

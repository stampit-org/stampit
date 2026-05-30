/* ============================================================================
 *  TYPE LAYER
 *  ---------------------------------------------------------------------------
 *  None of the types below exist at runtime. They describe the public surface
 *  of a Stamp so the compiler can accumulate the instance shape (`I`) and the
 *  statics shape (`S`) as you chain and compose.
 * ==========================================================================*/

/** Flattens an intersection into a single readable object type. */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Shallow object spread at the type level: keys of `R` win over `L`.
 * Mirrors the runtime `assignOne`/`mergeComposable` "last one wins" semantics.
 */
type Spread<L, R> = Prettify<Omit<L, keyof R> & R>;

/** Merge a tuple of objects left→right; later elements win (like `assign({}, ...args)`). */
type MergeAll<T extends readonly unknown[]> = T extends readonly [infer H, ...infer Rest]
  ? Spread<H & {}, MergeAll<Rest>>
  : {};

// Phantom carrier. An optional `unique symbol` key stashes the statics shape `S`
// on a Stamp's type without affecting the runtime value or string-keyed
// completion. It is the clean handle used to recover `S` from an existing Stamp
// during composition (see `ComposableStatics`). The instance shape `I` needs no
// phantom — it is recovered directly from the Stamp's factory call signature
// (`(...args) => I`, see `ComposableInstance`).
declare const PHANTOM_STATICS: unique symbol;
interface StampPhantom<S> {
  readonly [PHANTOM_STATICS]?: S;
}

/** A factory function: call it (optionally with options) to get an instance. */
interface FactoryFunction<I, O = object> {
  (options?: O, ...args: any[]): I;
}

/** The context object passed as the 2nd argument to every initializer. */
interface InitializerContext<I> {
  /** The object instance being produced. Returning a non-`undefined` value replaces it. */
  instance: I;
  /**
   * A reference to the Stamp producing the instance. Its statics are typed
   * loosely (`any`) on purpose: pinning them here would make `Stamp` invariant
   * in `S`, which breaks the common `let X = stampit(...); X = X.statics(...)`
   * reassignment pattern. `stamp()` still returns a precisely-typed instance.
   */
  stamp: Stamp<I, any>;
  /** All arguments passed into the Stamp, including the options argument. */
  args: any[];
}

/**
 * A function used as an `.init()` / `.initializers()` argument.
 * @template I The instance type (`this` and the produced object).
 * @template O The options object this initializer reads (the factory's 1st arg).
 *   Captured from the `initializers` so the produced factory's options type can be
 *   built from them.
 */
interface Initializer<I = any, O = any> {
  (this: I, options: O, context: InitializerContext<I>): void | I;
}

/**
 * An initializer as it is written *inside a descriptor literal*
 * (`stampit({ init(options) { … } })`).
 *
 * Unlike {@link Initializer}, it declares **no explicit `this`**. That omission is
 * load-bearing: an explicit `this` in a property's declared type overrides the
 * `ThisType<…>` contextual marker, whereas a `this`-less signature lets the
 * `ThisType<InstanceOf<T>>` that `StampitArgs` injects onto the descriptor set
 * `this` to the produced instance. (The chainable `.init(fn)` form can't use this
 * shape — there `fn` is a standalone argument that `ThisType` can't reach, so it
 * needs `Initializer<I, O>`'s explicit `this: I` instead.)
 * @template O The options object this initializer reads (the factory's 1st arg).
 */
interface DescriptorInitializer<O = any> {
  (options: O, context: InitializerContext<any>): void | any;
}

/** The parameters received by a `.composers()` function. */
interface ComposerParameters<S> {
  /** The result of the composables' composition. */
  stamp: S;
  /** The list of composables the Stamp was just composed of. */
  composables: Composable[];
}

/** A function used as a `.composers()` argument. */
interface Composer<S = any> {
  (parameters: ComposerParameters<S>): void | S;
}

/**
 * A standard (already-normalised) Stamp descriptor.
 *
 * Per the stamp specification a descriptor is *just data*: a plain bag of the
 * spec's descriptor properties. It deliberately carries NO instance/statics type
 * parameters and NO `this` typing — all type inference lives in the function
 * signatures that consume/produce descriptors (`compose`, `stampit`, and the
 * chainable Stamp methods), never in the descriptor itself. This is also exactly
 * the shape exposed on `Stamp.compose`.
 */
interface Descriptor {
  methods?: object;
  properties?: object;
  deepProperties?: object;
  propertyDescriptors?: PropertyDescriptorMap;
  staticProperties?: object;
  staticDeepProperties?: object;
  staticPropertyDescriptors?: PropertyDescriptorMap;
  initializers?: DescriptorInitializer | DescriptorInitializer[];
  composers?: Composer | Composer[];
  configuration?: object;
  deepConfiguration?: object;
}

/**
 * The stampit-flavoured descriptor accepted by `stampit(...)`. Same idea as
 * `Descriptor` — a plain property bag — plus stampit's short aliases. Like
 * `Descriptor`, it knows nothing about instance/statics types or `this`.
 */
interface ExtendedDescriptor extends Descriptor {
  props?: object;
  deepProps?: object;
  statics?: object;
  deepStatics?: object;
  init?: DescriptorInitializer | DescriptorInitializer[];
  conf?: object;
  deepConf?: object;
  name?: string;
}

/**
 * Anything the standard `compose()` accepts — a Stamp or a standard `Descriptor`.
 * Per the spec, a composable is exactly this: it is NOT the extended descriptor.
 */
type Composable = StampSignature | Descriptor;

/**
 * Anything `stampit()` — and a stamp's infected `.compose` — accepts: a Stamp or
 * an `ExtendedDescriptor`. `stampit` standardises these down to `Composable`s
 * (via `standardiseDescriptor`) before delegating to the standard `compose()`.
 */
type ExtendedComposable = StampSignature | ExtendedDescriptor;

/** The minimal callable+composable shape shared by every Stamp. */
interface StampSignature {
  (options?: object, ...args: any[]): any;
  compose: any;
}

// --- Extracting `I` and `S` out of an arbitrary composable -------------------

/**
 * Reads `D[K]` if present (including when `K` is an *optional* property),
 * otherwise contributes nothing (`{}`). Using `keyof` rather than
 * `Record<K, infer V>` matters: the `Record` check only matches *required*
 * keys, so an optional `methods?`/`props?` on a descriptor type would be dropped.
 */
type Prop<D, K extends PropertyKey> = K extends keyof D ? Exclude<D[K], undefined> : {};

/** The instance contribution of a descriptor object (methods + props + deepProps). */
type DescriptorInstance<D> = Prettify<
  Prop<D, "methods"> & Prop<D, "properties"> & Prop<D, "props"> & Prop<D, "deepProperties"> & Prop<D, "deepProps">
>;

/** The statics contribution of a descriptor object. */
type DescriptorStatics<D> = Prettify<
  Prop<D, "staticProperties"> & Prop<D, "statics"> & Prop<D, "staticDeepProperties"> & Prop<D, "deepStatics">
>;

/** Instance shape contributed by a single composable (Stamp → its `I`, descriptor → its data). */
type ComposableInstance<C> = C extends (...args: any[]) => infer I ? I : DescriptorInstance<C>;

/** Statics shape contributed by a single composable (Stamp → its `S`, descriptor → its statics). */
type ComposableStatics<C> = C extends (...args: any[]) => any
  ? C extends StampPhantom<infer S>
    ? S
    : {}
  : DescriptorStatics<C>;

/** Fold the instance contributions of an entire tuple of composables; later wins. */
type InstanceOf<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
  ? Spread<ComposableInstance<H>, InstanceOf<R>>
  : {};

/** Fold the statics contributions of an entire tuple of composables; later wins. */
type StaticsOf<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
  ? Spread<ComposableStatics<H>, StaticsOf<R>>
  : {};

/**
 * The first (options) parameter type of an initializer function. Falls back to
 * `object` for a non-function / no-init.
 */
type InitOptions<F> = F extends (options: infer O, ...args: any[]) => any ? O : object;

/** Collapse a union into an intersection (used to merge initializers' option types). */
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/** Unwrap an `init`/`initializers` value (a function, or an array of functions) to a union of functions. */
type InitFns<X> = X extends readonly (infer E)[] ? E : X;

/** Options contributed by each *descriptor* composable's initializers (Stamps contribute none). */
type OptionItems<T extends readonly unknown[]> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? never
    : InitOptions<InitFns<Prop<T[K], "init">>> | InitOptions<InitFns<Prop<T[K], "initializers">>>;
}[number];

/**
 * The merged options object the produced factory accepts: the intersection of
 * every initializer's first (options) argument across ALL composables — so
 * `Stamp({ … })` completes the options' props. `object` when there are none.
 */
type OptionsAll<T extends readonly unknown[]> = [OptionItems<T>] extends [never]
  ? object
  : UnionToIntersection<OptionItems<T>>;

/**
 * Wraps each composable so that, inside a descriptor's `methods`, `this` is the
 * produced instance (`InstanceOf<T>`). `ThisType<…>` is NON-inferential, so the
 * composable tuple `T` still infers cleanly, and intersecting it is safe for Stamp
 * arguments too (a Stamp's chainable members are unaffected by the `{}`-marker).
 *
 * NOTE: only `methods` get `this` here. A descriptor's `init`/`initializers` are
 * plain functions, whose `this` can only be set by an explicit `this:` parameter
 * (`ThisType` can't reach a standalone function). Doing that in this variadic
 * position would break two common, legitimate cases — an un-annotated
 * `init({ x })` (circular inference → implicit-any) and re-composing a Stamp that
 * has a non-`object` options type — so `this` inside initializers stays loose.
 */
type StampitArgs<T extends readonly unknown[]> = {
  [K in keyof T]: T[K] & ThisType<InstanceOf<T>> & { methods?: ThisType<InstanceOf<T>> };
};

/**
 * The composition function attached to every Stamp. It is BOTH callable
 * (returns a Stamp merging `this` with the given composables) AND carries the
 * Stamp's metadata (the `Descriptor`).
 */
type ComposeProperty<I, S> = {
  <T extends ExtendedComposable[]>(
    ...composables: T
  ): Stamp<Prettify<Spread<I, InstanceOf<T>>>, Prettify<Spread<S, StaticsOf<T>>>>;
} & Descriptor;

/**
 * The chainable methods of a Stamp. Each returns a *new* Stamp type with the
 * added shape merged in, so completion accumulates across the whole chain.
 *
 * Two overloads each:
 *   1. single object  — precise `this` (via `ThisType`) + precise accumulation.
 *   2. variadic       — `.methods(a, b, …)`, accumulates all args (looser `this`).
 */
interface Chainables<I, S> {
  /** Add methods to the instance prototype. Inside the bodies, `this` is the instance. */
  methods<M extends object>(methods: M & ThisType<Prettify<Spread<I, M>>>): Stamp<Prettify<Spread<I, M>>, S>;
  methods<M extends readonly object[]>(...methods: [...M]): Stamp<Prettify<Spread<I, MergeAll<M>>>, S>;

  /** Shallow-assign properties onto each new instance. */
  properties<P extends object>(properties: P): Stamp<Prettify<Spread<I, P>>, S>;
  properties<P extends readonly object[]>(...properties: [...P]): Stamp<Prettify<Spread<I, MergeAll<P>>>, S>;

  /** Alias of `properties`. */
  props<P extends object>(props: P): Stamp<Prettify<Spread<I, P>>, S>;
  props<P extends readonly object[]>(...props: [...P]): Stamp<Prettify<Spread<I, MergeAll<P>>>, S>;

  /** Deep-merge properties into each new instance. */
  deepProperties<P extends object>(deepProperties: P): Stamp<Prettify<Spread<I, P>>, S>;
  deepProperties<P extends readonly object[]>(...deepProperties: [...P]): Stamp<Prettify<Spread<I, MergeAll<P>>>, S>;

  /** Alias of `deepProperties`. */
  deepProps<P extends object>(deepProps: P): Stamp<Prettify<Spread<I, P>>, S>;
  deepProps<P extends readonly object[]>(...deepProps: [...P]): Stamp<Prettify<Spread<I, MergeAll<P>>>, S>;

  /**
   * Add static properties to the Stamp. Inside static method bodies, `this` is
   * the **whole Stamp** — so `this(...)` returns an instance and a cached
   * singleton field is reachable. This is what makes `Stamp.getInstance()` infer
   * the instance type.
   */
  staticProperties<St extends object>(
    statics: St & ThisType<Stamp<I, Prettify<Spread<S, St>>>>,
  ): Stamp<I, Prettify<Spread<S, St>>>;
  staticProperties<St extends readonly object[]>(...statics: [...St]): Stamp<I, Prettify<Spread<S, MergeAll<St>>>>;

  /** Alias of `staticProperties`. */
  statics<St extends object>(
    statics: St & ThisType<Stamp<I, Prettify<Spread<S, St>>>>,
  ): Stamp<I, Prettify<Spread<S, St>>>;
  statics<St extends readonly object[]>(...statics: [...St]): Stamp<I, Prettify<Spread<S, MergeAll<St>>>>;

  /** Deep-merge static properties onto the Stamp. */
  staticDeepProperties<St extends object>(
    deepStatics: St & ThisType<Stamp<I, Prettify<Spread<S, St>>>>,
  ): Stamp<I, Prettify<Spread<S, St>>>;
  staticDeepProperties<St extends readonly object[]>(
    ...deepStatics: [...St]
  ): Stamp<I, Prettify<Spread<S, MergeAll<St>>>>;

  /** Alias of `staticDeepProperties`. */
  deepStatics<St extends object>(
    deepStatics: St & ThisType<Stamp<I, Prettify<Spread<S, St>>>>,
  ): Stamp<I, Prettify<Spread<S, St>>>;
  deepStatics<St extends readonly object[]>(...deepStatics: [...St]): Stamp<I, Prettify<Spread<S, MergeAll<St>>>>;

  /**
   * Add initializers. Inside the bodies, `this` is the instance. The initializers'
   * options type `O` is captured and becomes the produced Stamp's factory options
   * (so `stamp({ … })` completes those props).
   */
  initializers<O = object>(...functions: Array<Initializer<I, O>>): Stamp<I, S, O>;
  initializers<O = object>(functions: Array<Initializer<I, O>>): Stamp<I, S, O>;

  /** Alias of `initializers`. */
  init<O = object>(...functions: Array<Initializer<I, O>>): Stamp<I, S, O>;
  init<O = object>(functions: Array<Initializer<I, O>>): Stamp<I, S, O>;

  /** Add composers, run while composing a new Stamp. */
  composers(...functions: Array<Composer<Stamp<I, any>>>): Stamp<I, S>;
  composers(functions: Array<Composer<Stamp<I, any>>>): Stamp<I, S>;

  /** Shallow-assign arbitrary metadata. */
  configuration(...confs: object[]): Stamp<I, S>;
  /** Alias of `configuration`. */
  conf(...confs: object[]): Stamp<I, S>;

  /** Deep-merge arbitrary metadata. */
  deepConfiguration(...deepConfs: object[]): Stamp<I, S>;
  /** Alias of `deepConfiguration`. */
  deepConf(...deepConfs: object[]): Stamp<I, S>;

  /** Apply ES5 property descriptors to instances. */
  propertyDescriptors(...descriptors: PropertyDescriptorMap[]): Stamp<I, S>;

  /** Apply ES5 property descriptors to the Stamp. */
  staticPropertyDescriptors(...descriptors: PropertyDescriptorMap[]): Stamp<I, S>;

  /**
   * Creates and returns a new instance — identical to calling the Stamp directly.
   * `create` is NOT part of the bare stamp spec; `stampit` adds it as a static
   * (via `staticUtils`), so it lives here among the other stampit-provided
   * statics rather than being hard-coded onto the base Stamp shape.
   */
  create: FactoryFunction<I>;
}

/**
 * A Stamp: a factory function producing instances of `I`, carrying statics `S`,
 * plus the chainable composition API.
 * @template I The instance object type the Stamp creates.
 * @template S The statics object type attached to the Stamp.
 * @template O The options object the factory accepts — derived from the
 *   initializers' first argument(s). Defaults to `object`; only the
 *   descriptor-form `stampit({...})` pins it precisely.
 */
type Stamp<I, S, O = object> = FactoryFunction<I, O> &
  Chainables<I, S> &
  StampPhantom<S> &
  S & {
    /** The composition function, which also exposes the Stamp's descriptor metadata. */
    compose: ComposeProperty<I, S>;
  };

/** The signature of the default-exported `stampit` / `compose` function. */
interface Stampit {
  <T extends ExtendedComposable[]>(
    ...composables: StampitArgs<T>
  ): Stamp<Prettify<InstanceOf<T>>, Prettify<StaticsOf<T>>, Prettify<OptionsAll<T>>>;
}

/**
 * The shape of the shared `staticUtils` object — stampit's built-in chainable
 * methods that are attached as static properties to every Stamp. Each is called
 * with `this` bound to the *parent Stamp* (so `this.compose(...)` is available)
 * and returns a new derived Stamp; `create` returns a new instance of the parent
 * Stamp. These are the *implementation* signatures — the precise,
 * type-accumulating public surface is `Chainables<I, S>` on `Stamp<I, S>`.
 */
interface StaticUtilities {
  methods(this: Stamp<any, any>, ...methods: object[]): Stamp<any, any>;
  properties(this: Stamp<any, any>, ...properties: object[]): Stamp<any, any>;
  initializers(this: Stamp<any, any>, ...initializers: Array<Initializer | Initializer[]>): Stamp<any, any>;
  composers(this: Stamp<any, any>, ...composers: Array<Composer | Composer[]>): Stamp<any, any>;
  deepProperties(this: Stamp<any, any>, ...deepProperties: object[]): Stamp<any, any>;
  staticProperties(this: Stamp<any, any>, ...staticProperties: object[]): Stamp<any, any>;
  staticDeepProperties(this: Stamp<any, any>, ...staticDeepProperties: object[]): Stamp<any, any>;
  configuration(this: Stamp<any, any>, ...configuration: object[]): Stamp<any, any>;
  deepConfiguration(this: Stamp<any, any>, ...deepConfiguration: object[]): Stamp<any, any>;
  propertyDescriptors(this: Stamp<any, any>, ...propertyDescriptors: PropertyDescriptorMap[]): Stamp<any, any>;
  staticPropertyDescriptors(
    this: Stamp<any, any>,
    ...staticPropertyDescriptors: PropertyDescriptorMap[]
  ): Stamp<any, any>;
  /** Creates and returns a new instance of the parent Stamp. */
  create<I>(this: Stamp<I, any>, options?: object, ...args: any[]): I;
  /** The infected `compose` (a.k.a. `stampit`). */
  compose: Stampit;
  // Short aliases, assigned after the literal is created (hence optional here).
  props?: StaticUtilities["properties"];
  init?: StaticUtilities["initializers"];
  deepProps?: StaticUtilities["deepProperties"];
  statics?: StaticUtilities["staticProperties"];
  deepStatics?: StaticUtilities["staticDeepProperties"];
  conf?: StaticUtilities["configuration"];
  deepConf?: StaticUtilities["deepConfiguration"];
}

export type {
  Stamp,
  Composable,
  ExtendedComposable,
  Descriptor,
  ExtendedDescriptor,
  Initializer,
  InitializerContext,
  Composer,
  ComposerParameters,
  Stampit,
};

/* ============================================================================
 *  RUNTIME
 *  ---------------------------------------------------------------------------
 *  1:1 port of stampit.js. Logic is unchanged; internals are typed loosely
 *  (`any`) on purpose — the public types live entirely in the layer above and
 *  are applied to the `stampit` export via its declared overload signature.
 * ==========================================================================*/

function isFunction(obj: any): obj is Function {
  return typeof obj === "function";
}

function isObject(obj: any): boolean {
  return (obj && typeof obj === "object") || isFunction(obj);
}

function isPlainObject(value: any): boolean {
  return value && typeof value === "object" && value.__proto__ === Object.prototype;
}

/**
 * Returns true if argument is a Stamp.
 * @param {*} obj Any object
 * @returns {Boolean} True is the obj is a Stamp
 */
function isStamp(obj: any): boolean {
  return isFunction(obj) && isFunction(obj.compose);
}

function getOwnPropertyKeys(obj: any): Array<string | symbol> {
  return [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];
}

/**
 * Returns `undefined` if the prop was assigned. Otherwise, returns the JS property descriptor of the `src[key]`
 * @param dst destination object
 * @param src source object
 * @param key the key to copy from src to dst
 * @returns {PropertyDescriptor|undefined} The `undefined` will be returned if the prop does not need to be copied.
 */
function defineProp(dst: any, src: any, key: any): PropertyDescriptor | undefined {
  const desc = Object.getOwnPropertyDescriptor(src, key)!;
  // is this a regular property?
  if (desc.hasOwnProperty("value")) {
    // Ignore properties if the existing src prop value is 'undefined'.
    if (desc.value !== undefined) {
      return desc;
    }
  } else {
    // nope, it looks like a getter/setter
    // Make it rewritable because two stamps can have same named getter/setter
    Object.defineProperty(dst, key, desc);
  }
}

/**
 * Unlike Object.assign(), our assign() copies symbols, getters and setters.
 * @param {Object} dst Must be an object. Otherwise throws.
 * @param {Object} [src] Can be falsy
 * @returns {Object} updated 'dst'
 */
function assignOne(dst: any, src: any): any {
  if (src) {
    // We need to copy regular props, symbols, getters and setters.
    for (const key of getOwnPropertyKeys(src)) {
      const srcValueDesc = defineProp(dst, src, key);
      if (srcValueDesc) dst[key] = srcValueDesc.value;
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
function mergeOne(dst: any, src: any): any {
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
    const srcValueDesc = defineProp(dst, src, key);
    if (srcValueDesc)
      // deep merge each property. Recursion!
      dst[key] = mergeOne(
        isPlainObject(dst[key]) || Array.isArray(srcValueDesc.value) ? dst[key] : {},
        srcValueDesc.value,
      );
  }

  return dst;
}

const assign = (dst: object, ...args: Array<object | undefined>): object => args.reduce(assignOne, dst);

const merge = (dst: object, ...args: Array<object | undefined>): object => args.reduce(mergeOne, dst);

function extractUniqueFunctions(...args: any[]): Function[] | undefined {
  const funcs = new Set(args.flat().filter(isFunction));
  return funcs.size ? [...funcs] : undefined;
}

/**
 * Creates new factory instance.
 * @returns {Stamp} The new Stamp (factory function).
 */
function createEmptyStamp(): Stamp<any, any> {
  return function Stamp(this: any, ...args: any[]): any {
    let options = args[0];
    const descriptor: Descriptor = (Stamp as any).compose || {};

    // Next line was optimized for most JS VMs. Please, be careful here!
    // The instance of this Stamp
    let instance = descriptor.methods ? Object.create(descriptor.methods) : {};

    mergeOne(instance, descriptor.deepProperties);
    assignOne(instance, descriptor.properties);
    if (descriptor.propertyDescriptors) Object.defineProperties(instance, descriptor.propertyDescriptors);

    const inits = descriptor.initializers;
    // No initializers?
    if (!Array.isArray(inits) || inits.length === 0) return instance;

    // The spec. says that the first argument to every initializer must be an
    // empty object if nothing else was given when a Stamp was called: Stamp()
    if (options === undefined) options = {};

    for (let i = 0, initializer: Initializer, returnedValue; i < inits.length; ) {
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
 * (either descriptor or Stamp) to merge data form.
 * @returns {Descriptor} Returns the dstDescriptor argument.
 */
function mergeComposable(dstDescriptor: Descriptor, srcComposable: Composable): Descriptor {
  function mergeAssign(propName: any, action: any): void {
    if (!isObject((srcComposable as any)[propName])) {
      return;
    }
    if (!isObject((dstDescriptor as any)[propName])) {
      (dstDescriptor as any)[propName] = {};
    }
    action((dstDescriptor as any)[propName], (srcComposable as any)[propName]);
  }

  function concatAssignFunctions(propName: any): void {
    const funcs = extractUniqueFunctions((dstDescriptor as any)[propName], (srcComposable as any)[propName]);
    if (funcs) (dstDescriptor as any)[propName] = funcs;
  }

  srcComposable = (srcComposable as any)?.compose || srcComposable;
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
 * Given the list of composables (Stamp descriptors and stamps) returns
 * a new Stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...Composable} args The list of composables (aka plain objects and/or other stamps)
 * @returns {Stamp} A new Stamp (aka composable factory function)
 */
function compose<This, T extends Composable[]>(
  this: This,
  ...composables: T
): Stamp<
  Prettify<Spread<ComposableInstance<This>, InstanceOf<T>>>,
  Prettify<Spread<ComposableStatics<This>, StaticsOf<T>>>
>;
function compose(this: any, ...args: any[]): any {
  // "Composable" is both Descriptor and Stamp.
  // The "this" context must be the first in the list.
  const composables = [this, ...args].filter(isObject);

  let stamp = createEmptyStamp();
  const descriptor: Descriptor = composables.reduce(mergeComposable, {});

  mergeOne(stamp, descriptor.staticDeepProperties);
  assignOne(stamp, descriptor.staticProperties);
  if (descriptor.staticPropertyDescriptors) Object.defineProperties(stamp, descriptor.staticPropertyDescriptors);

  const c = isFunction(stamp.compose) ? stamp.compose : compose; // either use the Infected Compose or the standard one.
  stamp.compose = function (this: any, ...args: any[]): any {
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

/////////////
///////////// NOTE! Everything above is the compose(). The below is the stampit(). /////////////
/////////////

/**
 * Converts stampit extended descriptor to a standard one.
 * @param {Object} descr
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
function standardiseDescriptor(descr: ExtendedDescriptor): Descriptor {
  // Avoid processing non-objects. Also, do not process stamps because they are already standard.
  if (!isObject(descr) || isStamp(descr)) return descr;

  const out: any = {};

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
  // `descr.name && {…}` is `"" | {…} | undefined`; the falsy `""` is skipped by
  // `assignOne` at runtime, so narrow it (types-only) to the object source shape.
  const spd2 = descr.name && { name: { value: descr.name } };
  out.staticPropertyDescriptors = isObject(spd2 || spd1) ? assign({}, spd1, spd2 as object | undefined) : undefined;

  const c1 = descr.configuration;
  const c2 = descr.conf;
  out.configuration = isObject(c1 || c2) ? assign({}, c2, c1) : undefined;

  const dc1 = descr.deepConfiguration;
  const dc2 = descr.deepConf;
  out.deepConfiguration = isObject(dc1 || dc2) ? merge({}, dc2, dc1) : undefined;

  return out;
}

const staticUtils: StaticUtilities = {
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
staticUtils.props = staticUtils.properties;
staticUtils.init = staticUtils.initializers;
staticUtils.deepProps = staticUtils.deepProperties;
staticUtils.statics = staticUtils.staticProperties;
staticUtils.deepStatics = staticUtils.staticDeepProperties;
staticUtils.conf = staticUtils.configuration;
staticUtils.deepConf = staticUtils.deepConfiguration;

/**
 * Create and return a Stamp.
 *
 * Per the stamp specification, `stampit` takes a *list of composables* (each an
 * `ExtendedDescriptor` or a Stamp) and returns a new Stamp. `StampitArgs<T>`
 * wraps the arguments so that, inside any descriptor's `methods`/`init`, `this`
 * is the produced instance, and `OptionsAll<T>` derives the factory's options
 * from the initializers — all without `ExtendedDescriptor` itself carrying any
 * `this`/instance typing (it stays a plain bag).
 * @param {...Composable} args The list of composables (aka plain objects and/or other stamps)
 * @returns {Stamp} The stampit-flavoured Stamp
 */
function stampit<T extends ExtendedComposable[]>(
  ...composables: StampitArgs<T>
): Stamp<Prettify<InstanceOf<T>>, Prettify<StaticsOf<T>>, Prettify<OptionsAll<T>>>;
function stampit(this: any, ...args: any[]): any {
  return compose(this, { staticProperties: staticUtils }, ...args.map(standardiseDescriptor));
}

export default stampit;

export { stampit as "module.exports" };

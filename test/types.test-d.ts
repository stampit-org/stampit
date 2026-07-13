// Type-level tests for stampit.ts. This file produces NO runtime output — it is
// compiled by `tsc --noEmit` (see tsconfig.types-test.json). A successful, clean
// compile *is* the passing test. Named `*.test-d.ts` so it is not matched by the
// runtime runner's `node --test "test/*.test.js"` glob.

import stampit, { type ExtendedDescriptor, type Stamp } from "../stampit.ts";

// A tiny assertion helper: `expectType<T>()(value)` errors unless `value` is a `T`.
const expectType =
  <T>() =>
  (_value: T): void => {};

/* ───────────────────────────────────────────────────────────────────────────
 * 1. methods + props accumulate; `this` inside methods is the instance.
 * ───────────────────────────────────────────────────────────────────────── */
{
  const S = stampit()
    .methods({
      foo() {
        return 1;
      },
      // `this` must see sibling methods → proves `this` is the instance type.
      bar() {
        return this.foo() + 1;
      },
    })
    .props({ x: 1 });

  const o = S();
  expectType<number>()(o.foo());
  expectType<number>()(o.bar());
  expectType<number>()(o.x);

  // create() returns the same instance type.
  const o2 = S.create();
  expectType<number>()(o2.x);

  // @ts-expect-error — `y` is not part of the instance.
  // oxlint-disable-next-line no-unused-expressions
  o.y;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 2. The headline case: a user-defined static `getInstance` that returns
 *    `this(...)` must infer the INSTANCE type, with full completion.
 * ───────────────────────────────────────────────────────────────────────── */
{
  // 2a. Simplest form — no caching field.
  const Singleton = stampit()
    .props({ x: 1 })
    .methods({
      hello() {
        return "hi";
      },
    })
    .statics({
      getInstance(...args: any[]) {
        return this(...args); // `this` is the Stamp → returns the instance
      },
    });

  const inst = Singleton.getInstance();
  expectType<number>()(inst.x);
  expectType<string>()(inst.hello());

  // 2b. Cached-singleton form (the real-world pattern). `instance` is typed to
  //     allow the assignment; note `instance: null` literally would need
  //     `instance: null as <Instance> | null` to satisfy strict assignment.
  const Cached = stampit()
    .props({ x: 1 })
    .statics({
      instance: undefined as undefined | { x: number },
      getInstance(...args: any[]) {
        return this.instance ?? (this.instance = this(...args));
      },
    });

  const cached = Cached.getInstance();
  expectType<number>()(cached.x);
}

/* ───────────────────────────────────────────────────────────────────────────
 * 3. Long chains keep accumulating precisely.
 * ───────────────────────────────────────────────────────────────────────── */
{
  const Long = stampit()
    .methods({
      m1() {
        return 1;
      },
    })
    .props({ p1: 1 })
    .methods({
      m2() {
        return "a";
      },
    })
    .props({ p2: true })
    .methods({
      m3() {
        return 1n;
      },
    })
    .props({ p3: { nested: 1 } })
    .methods({
      m4() {
        return [1, 2, 3];
      },
    })
    .props({ p4: "s" });

  const lo = Long();
  expectType<number>()(lo.m1());
  expectType<string>()(lo.m2());
  expectType<bigint>()(lo.m3());
  expectType<number[]>()(lo.m4());
  expectType<boolean>()(lo.p2);
  expectType<{ nested: number }>()(lo.p3);
  expectType<string>()(lo.p4);
}

/* ───────────────────────────────────────────────────────────────────────────
 * 4. Composition of an indefinite number of composables merges I and S.
 * ───────────────────────────────────────────────────────────────────────── */
{
  const A = stampit().props({ a: 1 });
  const B = stampit().props({ b: "x" });
  const C = stampit().methods({
    c() {
      return true;
    },
  });
  const D = stampit().statics({
    d() {
      return 1;
    },
  });
  const E = stampit().props({ e: [0] });

  // via stampit(...) with five composables
  const Composed = stampit(A, B, C, D, E);
  const co = Composed();
  expectType<number>()(co.a);
  expectType<string>()(co.b);
  expectType<boolean>()(co.c());
  expectType<number[]>()(co.e);
  expectType<number>()(Composed.d());

  // via Stamp.compose(...) with four composables
  const Composed2 = A.compose(B, C, D, E);
  const co2 = Composed2();
  expectType<number>()(co2.a);
  expectType<string>()(co2.b);
  expectType<boolean>()(co2.c());
  expectType<number>()(Composed2.d());

  // via a single extended descriptor passed to stampit(...)
  const Desc = stampit({
    methods: {
      hi() {
        return "hi";
      },
    },
    props: { n: 1 },
    statics: {
      make() {
        return 42;
      },
    },
  });
  const de = Desc();
  expectType<string>()(de.hi());
  expectType<number>()(de.n);
  expectType<number>()(Desc.make());
}

/* ───────────────────────────────────────────────────────────────────────────
 * 5. Initializer `this` is the instance; context is typed.
 * ───────────────────────────────────────────────────────────────────────── */
{
  const Init = stampit()
    .props({ count: 0 })
    .init(function (options, { instance, stamp, args }) {
      expectType<number>()(this.count); // `this` is the instance
      expectType<number>()(instance.count);
      expectType<any[]>()(args);
      // `stamp` is callable and returns an instance
      expectType<number>()(stamp().count);
    });

  expectType<number>()(Init().count);
}

/* ───────────────────────────────────────────────────────────────────────────
 * 6. `Stamp.compose` metadata accessors are typed.
 * ───────────────────────────────────────────────────────────────────────── */
{
  const M = stampit()
    .methods({
      foo() {
        return 1;
      },
    })
    .props({ x: 1 });

  // Descriptor accessors exist (object | undefined).
  const _methods: object | undefined = M.compose.methods;
  const _properties: object | undefined = M.compose.properties;
  // `compose` is also callable.
  const Recomposed = M.compose(stampit().props({ y: 2 }));
  expectType<number>()(Recomposed().x);
  expectType<number>()(Recomposed().y);
}

/* ───────────────────────────────────────────────────────────────────────────
 * 7. Incremental build by reassignment.
 *    The variable MUST be declared without an initializer (`let X;`), so its
 *    type can keep growing on each reassignment. Adding via any chainable —
 *    props/methods/statics/deepProps/… — keeps autocompleting precisely.
 * ───────────────────────────────────────────────────────────────────────── */
{
  let X;
  X = stampit({ props: { bar: 1 } });
  X = X.methods({
    foo() {
      return this.bar; // sees `bar` added in the previous step
    },
  });
  X = X.props({ baz: "s" });
  X = X.deepProps({ nested: { k: 1 } });
  X = X.statics({
    // Cached singleton. Use `this(...)` (not `X(...)`) — referencing the
    // still-evolving `X` in a type query resets it to `any`. Cast with
    // `ReturnType<typeof this>` to type the cache as the instance.
    instance: undefined as unknown,
    getInstance(...args: any[]) {
      return (this.instance ?? (this.instance = this(...args))) as ReturnType<typeof this>;
    },
  });
  X = X.staticProperties({ version: 2 });

  // Every member added across the chain autocompletes:
  expectType<number>()(X().bar);
  expectType<number>()(X().foo());
  expectType<string>()(X().baz);
  expectType<number>()(X().nested.k);
  expectType<number>()(X.version);
  // The user-defined singleton returns the full instance interface:
  expectType<number>()(X.getInstance().bar);
  expectType<number>()(X.getInstance().foo());
  expectType<string>()(X.getInstance().baz);

  // @ts-expect-error — members never added stay unknown.
  // oxlint-disable-next-line no-unused-expressions
  X().nope;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 8. Framework of Service
 * ───────────────────────────────────────────────────────────────────────── */
{
  const stampSymbol = Symbol.for("stamp");

  const CanDoInstanceOf = stampit({
    methods: {},
    composers: [
      function canDoInstanceOf({ stamp }) {
        // Attaching to object prototype to save memory
        stamp.compose.methods[stampSymbol] = stamp;

        Object.defineProperty(stamp, Symbol.hasInstance, {
          value(obj: any) {
            return obj && obj[stampSymbol] === stamp;
          },
        });
      },
    ],
  });

  /**
   * Adds `myObject.config` to your object instances.
   */
  const HasConfig = stampit({
    props: {
      config: { env: "local" },
    },
    init({ config }) {
      this.config = config || this.config;
    },
    composers({ stamp }) {
      if (!stamp.compose.staticProperties) stamp.compose.staticProperties = {};
      stamp.compose.staticProperties.config = stamp.compose.properties.config; // copy config from instance props to static props, should probably be vice versa
    },
  });

  interface Logger {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  }

  /**
   * Adds MyService.getInstance() singleton getter.
   */
  const Singleton2 = stampit(HasConfig).statics({
    instance: null as unknown,

    /**
     * Returns the singleton instance of the service
     */
    getInstance(...args: any[]) {
      this.instance = this.instance || this.create(...args);
      // `ReturnType<typeof this>` is the type of `this()` — the instance.
      return this.instance as ReturnType<typeof this>;
    },
  });

  /**
   * Adds `myObject.log` logger to your object instances.
   */
  const HasLog = stampit({
    props: {
      log: undefined as unknown as Logger,
    },
    init(_, { stamp }) {
      if (this.log) return; // logger already exists
      if (stamp.name === "Stamp") throw new Error("Couldn't initialize logger. No name was given.");
      this.log = stamp.log || { info() {}, warn() {}, error() {} };
    },
    // Composer is executed AFTER the stamp is composed by stampit.
    composers({ stamp }) {
      if (!stamp.log && stamp.name !== "Stamp") {
        // Let's add STATIC .log property. So that this would work in STATIC methods: this.log.error(...)
        // But we should not add any static log if the name of the stamp was never provided.
        const log = { info() {}, warn() {}, error() {} };
        if (!stamp.compose.statics) stamp.compose.statics = {};
        stamp.compose.statics.log = log;
        stamp.log = log;
      }
    },
  }).statics({
    /**
     * All log actions become No-Op. Used heavily in unit tests.
     * @returns {this}
     */
    silenceLogging() {
      const noop = () => {};
      return this.props({ log: { trace: noop, debug: noop, info: noop, warn: noop, error: noop, fatal: noop } });
    },
  });

  /**
   * The shape of a service descriptor: just an `ExtendedDescriptor` plus a
   * `dependencies` factory. It stays a plain property bag — the method-map
   * capture and `this` typing are applied in the `service` function signatures
   * below (where inference belongs), not here.
   * @template D The dependencies object (what `dependencies()` returns).
   */
  interface ServiceDescriptor<D extends object> extends ExtendedDescriptor {
    /**
     * Dependencies — either a lazy factory returning them, or the object itself
     * (the `init` calls it if it's a function). Each key is injected as an
     * instance property at runtime.
     */
    dependencies?: (() => D) | D;
  }

  /**
   * Reflects the dependency object `D` onto a service stamp's INSTANCE type. The
   * Service `init` assigns each `dependencies()` key onto the instance at runtime,
   * but they travel via `configuration`, so the static `compose(...)` return type
   * cannot infer them — we add them to the instance (keeping the statics `S`) here.
   */
  type WithDeps<St, D extends object> = St extends Stamp<infer I, infer S> ? Stamp<I & D, S> : never;

  /**
   * The dependency object of a service descriptor — whether `dependencies` is a
   * factory (`() => D`) or the object `D` itself.
   */
  type DepsOf<T> = T extends { dependencies?: infer Dep }
    ? Dep extends (...args: any[]) => infer R
      ? R extends object
        ? R
        : {}
      : Dep extends object
        ? Dep
        : {}
    : {};

  /**
   * This is the base for your services.
   * @function
   */
  const Service = stampit(HasConfig, HasLog, Singleton2, CanDoInstanceOf, {
    init(_, { stamp }) {
      const { service } = stamp.compose.configuration || {};
      if (!service || !service.dependencies) return;
      let deps = service.dependencies;
      if (typeof deps === "function") deps = deps(...arguments);
      if (typeof deps !== "object") return;
      // `this` is now the precise instance, so writing an arbitrary dependency
      // key needs a type-only cast (dynamic string-keyed writes aren't allowed on
      // a precise object type under strict mode). Casts erase — no runtime change.
      const self = this as Record<string, unknown>;
      for (const [propName, dependency] of Object.entries(deps)) {
        if (!self[propName]) self[propName] = dependency;
      }
    },
  }).statics({
    /**
     * Creates a new Service stamp from a `ServiceDescriptor` — conceptually the
     * same as `stampit(...)`, just specialised to compose onto the `Service` base
     * and stash `dependencies` into `configuration`. Generic over the whole
     * descriptor type `Desc` (so `this.compose(...)` folds the descriptor's
     * methods/props into the instance precisely), with each method's `this` typed
     * as the dependency object. Defined with `.statics({...})` so that `this` here
     * is the whole Service Stamp (needed for `this.compose(...)`).
     * @param descriptor Service descriptor; `name` is mandatory.
     */
    service<Desc extends ServiceDescriptor<object>>(descriptor: Desc & ThisType<DepsOf<Desc>>) {
      const { name, dependencies, ...args } = descriptor;
      if (!name) throw new Error("Service name is mandatory");
      return this.compose({ configuration: { service: { dependencies } } }, { name, ...args });
    },
  });

  /**
   * Utility function to pre-setup your service.
   * @param descriptor.name {String} Your service name. Required. Used in logger.
   * @param [descriptor.dependencies] {Function} Lazy factory returning the dependencies object.
   * @returns {Function}
   */
  const service = <Desc extends ServiceDescriptor<object>>(descriptor: Desc & ThisType<DepsOf<Desc>>) => {
    const stamp = Service.service(descriptor);
    // `stamp` already carries the descriptor's methods/props (compose folds them
    // in); add the dependency properties, which the runtime injects via the
    // Service `init` but the `compose(...)` return type can't see.
    return stamp as unknown as WithDeps<typeof stamp, DepsOf<Desc>>;
  };

  const AccountService = service({
    name: "AccountService",
    // Each KEY becomes an injected instance property: `this.AccountModel`, etc.
    dependencies: () => ({
      myProp1: {
        callMe() {
          return {};
        },
      },
      // oxlint-disable-next-line no-unused-vars
      AccountModel: {
        findById(str: string) {
          return str;
        },
      },
      // oxlint-disable-next-line no-unused-vars
      ClientModel: {
        findById(b: boolean) {
          return b;
        },
      },
      ProviderRouter: {
        callMeToo() {
          return "123";
        },
      },
    }),
    props: { a: 1 },
    conf: { b: 2 },
    deepProps: { c: 3 },
    init({ some = "text" }) {
      console.log(some);
    },

    methods: {
      async getPaginatedAccountRecords({
        filter,
        textSearch,
        sort,
        pagination,
      }: {
        filter: string;
        textSearch: string;
        sort: string;
        pagination: string;
      }): Promise<void> {
        // Dependencies are fully typed on `this` (not `any`):
        expectType<object>()(this.myProp1.callMe());
        expectType<string>()(this.AccountModel.findById("123"));
        expectType<boolean>()(this.ClientModel.findById(true));
        expectType<string>()(this.ProviderRouter.callMeToo());
        // @ts-expect-error - an undeclared dependency is rejected, proving `this` is precise.
        this.NotADependency();
        console.log(filter, textSearch, sort, pagination);
      },
    },
  });

  // ✅ The instance method is precisely typed now:
  AccountService().getPaginatedAccountRecords({ filter: "active", textSearch: "", sort: "", pagination: "" });
  // ❌ `filter` must be a string — TypeScript now recognises this:
  // @ts-expect-error - Type 'number' is not assignable to type 'string'.
  AccountService().getPaginatedAccountRecords({ filter: 1, textSearch: "", sort: "", pagination: "" });

  AccountService().log.info(AccountService().config);

  // Dependencies are real INSTANCE PROPERTIES (the `init` assigns each key onto
  // the instance), so they are typed on the externally-produced object too:
  expectType<object>()(AccountService().myProp1.callMe());
  expectType<string>()(AccountService().AccountModel.findById("123"));
  expectType<boolean>()(AccountService().ClientModel.findById(true));
  expectType<string>()(AccountService({ some: 999_999 }).ProviderRouter.callMeToo());

  // @ts-expect-error — an undeclared dependency is not on the instance.
  // oxlint-disable-next-line no-unused-expressions
  AccountService().NotADependency;
}

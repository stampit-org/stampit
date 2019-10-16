/** Import 'stampit' module */
import stampit from '../types';

/** Import 'stampit' as ... module */
// import * as Stamp from 'stampit';

/** selective import from module */
// import {
//   compose,
//   composers
//   conf,
//   configuration,
//   deepConf,
//   deepConfiguration,
//   deepProperties,
//   deepProps,
//   deepStatics,
//   init,
//   initializers,
//   methods,
//   properties,
//   propertyDescriptors,
//   props,
//   staticDeepProperties,
//   staticProperties,
//   staticPropertyDescriptors,
//   version
// } from 'stampit';

const d: stampit.Descriptor<{}> = {
  methods: {},
  properties: {},
  deepProperties: {},
  propertyDescriptors: {},
  initializers: [],
  staticProperties: {},
  staticDeepProperties: {},
  staticPropertyDescriptors: {},
  composers: [],
  configuration: {},
  deepConfiguration: {},
  name: '',
  // shorthands
  props: {},
  deepProps: {},
  init: [],
  statics: {},
  deepStatics: {},
  conf: {},
  deepConf: {},
};

// The `.compose()` method
const compose = stampit.compose;

const stampUntyped = compose(); // $ExpectType Stamp<any>
stampUntyped(); // $ExpectType any
const stampAny = compose<any>(); // $ExpectType Stamp<any>
stampAny(); // $ExpectType any
const stampBigint = compose<bigint>(); // $ExpectType never
const stampBoolean = compose<boolean>(); // $ExpectType never
const stampNull = compose<null>(); // $ExpectType never
const stampNumber = compose<number>(); // $ExpectType never
const stampString = compose<string>(); // $ExpectType never
const stampSymbol = compose<symbol>(); // $ExpectType never
const stampUndefined = compose<undefined>(); // $ExpectType never
const stampUnknown = compose<unknown>(); // $ExpectType Stamp<unknown>
stampUnknown(); // $ExpectType unknown
const stampNever = compose<never>(); // $ExpectType never

// Declare interface of objects created by stamps
interface Object0 {
  action: () => void;
  value: number;
}

interface Object1 {
  reaction: () => void;
  property: number;
}

const stampObject0 = compose<Object0>(); // $ExpectType Stamp<Object0>
stampObject0(); // $ExpectType Object0

const stampObject1 = compose<Object1>(); // $ExpectType Stamp<Object1>
stampObject1(); // $ExpectType Object1

// Define a typed Descriptor and benefit is properly typed `this` in `methods`
const descriptor0: stampit.Descriptor<Object0> = {
  methods: {
    logGlobalThis: () => console.log(this),
    logLocalThis() { console.log(this); }, // this: I_Object0
  },
  properties: {},
  deepProperties: {},
  propertyDescriptors: {},
  staticProperties: {},
  staticDeepProperties: {},
  staticPropertyDescriptors: {},
  initializers: [
    function(options, context) {
      this; // this: any
      return context.instance;
    }
  ],
  composers: [
    function(parameters) {
      this; // this: any
      return parameters.stamp;
    }
  ],
  configuration: {},
  deepConfiguration: {}
};

const stampDescriptor0 = compose<typeof descriptor0>(); // $ExpectType Stamp<Object0>
stampDescriptor0(); // $ExpectType Object0

// check typed stamps... with untyped descriptor (`this` isn't typed in `methods`)
// inline type assertion is still possible though
const stampUntypedDescriptor0 = compose<Object0>(/* <stampit.Descriptor<Object0>> */ {
  methods: {
    logGlobalThis: () => console.log(this),
    logLocalThis() { console.log(this); }, // this: any
  },
} /* as stampit.Descriptor<Object0> */);
stampUntypedDescriptor0; // $ExpectType Stamp<Object0>
stampUntypedDescriptor0(); // $ExpectType Object0

// Check a stamp's `.compose()` method
const stamp1 = stampObject0.compose<Object1>(); // $ExpectType Stamp<Object1>
stamp1(); // $ExpectType Object1

// Define an extended stamp.
// The type of created object cannot be changed afterward
// Lazy interface composition can be done using the `&` intersection operator
interface ExtendedStamp extends stampit.Stamp<Object0 & Object1> {
  decompose: () => unknown;
}

// Invoke `.compose()` method with the type of the extended stamp
const extendedStamp0 = compose<ExtendedStamp>(); // $ExpectType ExtendedStamp
extendedStamp0(); // $ExpectType Object0 & Object1

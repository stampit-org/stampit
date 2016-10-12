import compose from './compose';

const assign = Object.assign;

export default function convertConstructor(ctor) {
  return compose({
    methods: assign({}, ctor.prototype),
    staticProperties: assign({}, ctor),
    configuration: { ctor },
    initializers: [
      (opts, {args, instance, stamp}) =>
        stamp.compose.configuration.ctor.apply(instance, args)
    ]
  })
}

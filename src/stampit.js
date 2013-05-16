/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/

// Shim .forEach()
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fn, scope) {
    var i,
      length = this.length;
    for (i = 0, length; i < length; ++i) {
      fn.call(scope || this, this[i], i, this);
    }
  };
}

// Shim Object.create()
if (!Object.create) {
  Object.create = function (o) {
    if (arguments.length > 1) {
      throw new Error('Object.create implementation only accepts the first parameter.');
    }
    function F() {}
    F.prototype = o;
    return new F();
  };
}

// Shim .bind()
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}


(function (root) {
  'use strict';

  var extend = function extend(obj) {
      var args = [].slice.call(arguments, 1);
      args.forEach(function (source) {
        var prop;
        for (prop in source) {
          if (source.hasOwnProperty(prop)) {
            obj[prop] = source[prop];
          }
        }
      });
      return obj;
    },

    stampit = function stampit(methods, state, enclose) {
      var fixed = {
          methods: methods || {},
          state: state ?
              JSON.parse(JSON.stringify(state)) :
              {},
          enclose: enclose
        },

        factory = function factory(properties, enclose) {
          var instance = extend(Object.create(fixed.methods || {}),
            fixed.state, properties),
            alt;

          if (typeof fixed.enclose === 'function') {
            alt = fixed.enclose.call(instance);
          }

          if (typeof enclose === 'function') {
            alt = enclose.call(alt || instance);
          }

          return alt || instance;
        };

      return extend(factory, {
        create: factory,
        fixed: fixed,
        methods: function (methods) {
          fixed.methods = fixed.methods ? extend(fixed.methods, methods) :
            methods;
          return this;
        },
        state: function (state) {
          fixed.state = fixed.state ? extend(fixed.state, state) :
            state;
          return this;
        },
        enclose: function (enclose) {
          fixed.enclose = enclose;
          return this;
        }
      });
    },

    compose = function compose() {
      var args = [].slice.call(arguments),
        initFunctions = [],
        obj = stampit(),
        props = ['methods', 'state'];

      args.forEach(function (source) {
        if (source) {
          props.forEach(function (prop) {
            if (source.fixed[prop]) {
              obj.fixed[prop] = extend(obj.fixed[prop],
                source.fixed[prop]);
            }
          });

          if (typeof source.fixed.enclose === 'function') {
            initFunctions.push(source.fixed.enclose);
          }
        }
      });

      return stampit(obj.fixed.methods, obj.fixed.state, function () {
        initFunctions.forEach(function (fn) {
          fn.call(this);
        }.bind(this));
      });
    },
    api = extend(stampit, {
      compose: compose,
      extend: extend
    });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.stampit = api;
  }
}((typeof exports === 'undefined') ?
    window :
    this));

'use strict'; // for node v4 and v5
const test = require('tape');

const Benchmark = require('benchmark');
const stampit = require('../..'); // Need to test the distributable


test('benchmarking object creation', (t) => {
  const Stamp = stampit({
    init() {
      this.x = 10;
      this.y = 10;
    },
    props: {p1: 10, p2: 10},
    methods: { m1() {}, m() {} },
    statics: { s1() {}}
  }, {
    init() {
      this.x2 = 10;
      this.y2 = 10;
    },
    props: {p1: 10, p2: 10},
    methods: { m2() {}, m() {} },
    statics: { s2() {}}
  }, {
    init() {
      this.x3 = 10;
      this.y3 = 10;
    },
    props: {p1: 10, p2: 10},
    methods: { m3() {}, m() {} },
    statics: { s3() {}}
  });

  class Class {
    constructor() {
      this.p1 = 10;
      this.p2 = 10;
      this.x = 10;
      this.y = 10;
    }
    m1() {}
    m() {}
    static s1() {}
  }

  class Class2 extends Class {
    constructor() {
      super();
      this.p1 = 10;
      this.p2 = 10;
      this.x2 = 10;
      this.y2 = 10;
    }
    m2() {}
    m() {}
    static s2() {}
  }

  class Class3 extends Class2 {
    constructor() {
      super();
      this.p1 = 10;
      this.p2 = 10;
      this.x3 = 10;
      this.y3 = 10;
    }
    m3() {}
    m() {}
    static s3() {}
  }

  const suite = new Benchmark.Suite();
  const results = [];
  suite
  .add('Stamp', () => {
    Stamp();
  })
  .add('Class', () => {
    new Class3();
  })
  .on('cycle', (event) => {
    results.push(String(event.target));
  })
  .on('complete', function () {
    t.ok(this[0].hz / this[1].hz >= 0.02,
      'creating a stamp should be less than 50 times slower, not more');
    t.comment(results.join('. '));
    t.end();
  })
  .run();
});

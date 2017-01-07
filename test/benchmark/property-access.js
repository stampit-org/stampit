const test = require('tape');
const _ = require('lodash');

const Benchmark = require('benchmark');
const stampit = require('../..'); // Need to test the distributable


test('benchmarking property access', (t) => {
  const Position = stampit({
    init() {
      this.x = 10;
      this.y = 10;
    }
  });

  const Velocity = stampit({
    init() {
      this.vx = 10;
      this.vy = 10;
    }
  });

  const Entity = stampit({
    deepProps: {
      components: {}
    },
    init() {
      this.components.position = Position();
      this.components.velocity = Velocity();
    }
  });

  const COUNT = 5000;
  const stampitEntities = _.range(COUNT).map(() => Entity());
  const normalEntities = _.range(COUNT).map(() => ({
    components: {
      position: {
        x: 10,
        y: 10,
      },
      velocity: {
        vy: 10,
        vx: 10,
      },
    },
  }));

  function runArray(arr) {
    const DELTA = 16;
    for (let i = 0; i < COUNT; i += 1) {
      const entity = arr[i].components;

      entity.position.x += (DELTA / 1000) * entity.velocity.vx;
      entity.position.y += (DELTA / 1000) * entity.velocity.vy;
    }
  }

  const suite = new Benchmark.Suite();
  const results = [];
  suite
    .add('Stampit', () => {
      runArray(stampitEntities);
    })
    .add('Plain object', () => {
      runArray(normalEntities);
    })
    .on('cycle', (event) => {
      results.push(String(event.target));
    })
    .on('complete', function () {
      t.ok(this[0].hz / this[1].hz >= 0.5,
        'object instances property access must be as fast as plain object.');
      t.comment(results.join('. '));
      t.end();
    })
    .run();
});

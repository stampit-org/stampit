const stampit = require('..');
const _ = require('lodash');
const assert = require('assert');

// Composing behaviors.

/**
 * Implements convertOne() method for future usage.
 */
const DbToApiCommodityConverter = stampit.methods({
  convertOne(entity) {
    var keysMap = {_id: 'id'};
    return _.mapKeys(_.pick(entity, ['category', '_id', 'name', 'price']), (v, k) => keysMap[k] || k);
  }
});

/**
 * Abstract converter. Implements convert() which does argument validation and can convert both arrays and single items.
 * Requires this.convertOne() to be defined.
 */
const Converter = stampit.methods({
  convert(entities) {
    if (!entities) {
      return;
    }

    if (!Array.isArray(entities)) {
      return this.convertOne(entities);
    }

    return _.map(entities, this.convertOne);
  }
});

/**
 * Database querying implementation: findById() and find()
 * Requires this.schema to be defined.
 */
const MongoDb = stampit.methods({
  findById(id) {
    return this.schema.findById(id);
  },

  find(params) {
    return this.schema.find(params);
  }
});

/**
 * The business logic. Defines getById() and search() which query DB and convert data with this.convert().
 * Requires this.convert() to be defined.
 */
const Commodity = stampit.methods({
  getById(id) {
    return this.findById(id).then(this.convert.bind(this));
  },

  search(fields = {price: {from: 0, to: Infinity}}) {
    return this.find({category: fields.categories, price: {gte: fields.price.from, lte: fields.price.to}})
      .then(this.convert.bind(this));
  }
})
  .compose(Converter, DbToApiCommodityConverter, MongoDb); // Adding the missing behavior

// Production code would look like so:
// const commodity = Commodity({
//   schema: MongooseCommoditySchema
// });
// commodity.getById(123).then(console.log);
// commodity.find({categories: 'kettle', price: {from: 0, to: 20}}).then(console.log);


// Unit testing code
const _mockItem = {category: 'kettle', _id: 42, name: 'Samsung Kettle', price: 4.2};
const FakeDb = stampit.methods({
  findById(id) { // Mocking the DB call
    return Promise.resolve(_mockItem);
  },
  find(params) { // Mocking the DB call
    return Promise.resolve([_mockItem]);
  }
});
const MockedCommodity = Commodity.compose(FakeDb);

const commodity = MockedCommodity();
commodity.getById().then(data => {
  assert.equal(data.category, _mockItem.category);
  assert.equal(data.id, _mockItem._id);
  assert.equal(data.name, _mockItem.name);
  assert.equal(data.price, _mockItem.price);
  console.log('getById works!');
}).catch(console.error);
commodity.search().then(data => {
  assert.equal(data.length, 1);
  assert.equal(data[0].category, _mockItem.category);
  assert.equal(data[0].id, _mockItem._id);
  assert.equal(data[0].name, _mockItem.name);
  assert.equal(data[0].price, _mockItem.price);
  console.log('search works!');
}).catch(console.error);

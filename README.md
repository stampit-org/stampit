<p align="center">
<img src="https://raw.githubusercontent.com/stampit-org/stampit-logo/master/stampit-logo.png" alt="stampit" width="160" />
</p>

# Stampit [![Build Status](https://travis-ci.org/stampit-org/stampit.svg?branch=master)](https://travis-ci.org/stampit-org/stampit) [![npm](https://img.shields.io/npm/dm/stampit.svg)](https://www.npmjs.com/package/stampit) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/stampit-org/stampit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Twitter Follow](https://img.shields.io/twitter/follow/stampit.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/stampit_org) [![UNPKG](https://img.shields.io/badge/gzip%20size-1.4%20kB-brightgreen.svg)](https://unpkg.com/stampit@latest/dist/stampit.min.js)

**Create objects from reusable, composable behaviors** 

Stampit is a **1.4KB** gzipped (or 3K minified) JavaScript module which supports three different kinds of prototypal inheritance (delegation, concatenation, and functional) to let you inherit behavior in a way that is much more powerful and flexible than any other Object Oriented Programming model.

 Stamps are [standardised](https://github.com/stampit-org/stamp-specification) composable factory functions. **Stampit** is a handy implementation of the specification featuring friendly API.

Find many more examples in [this series of mini blog posts](https://medium.com/@koresar/fun-with-stamps-episode-1-stamp-basics-e0627d81efe0) or on the [official website](https://stampit.js.org/api/quick-start).

## Example

```js
import stampit from 'stampit'

const Character = stampit({
  props: {
    name: null,
    health: 100
  },
  init({ name = this.name }) {
    this.name = name
  }
})

const Fighter = Character.compose({ // inheriting
  props: {
    stamina: 100
  },
  init({ stamina = this.stamina }) {
    this.stamina = stamina;    
  },
  methods: {
    fight() {
      console.log(`${this.name} takes a mighty swing!`)
      this.stamina--
    }
  }
})

const Mage = Character.compose({ // inheriting
  props: {
    mana: 100
  },
  init({ mana = this.mana }) {
    this.mana = mana;    
  },
  methods: {
    cast() {
      console.log(`${this.name} casts a fireball!`)
      this.mana--
    }
  }
})

const Paladin = stampit(Mage, Fighter) // as simple as that!

const fighter = Fighter({ name: 'Thumper' })
fighter.fight()
const mage = Mage({ name: 'Zapper' })
mage.cast()
const paladin = Paladin({ name: 'Roland', stamina: 50, mana: 50 })
paladin.fight()
paladin.cast()

console.log(Paladin.compose.properties) // { name: null, health: 100, stamina: 100, mana: 100 }
console.log(Paladin.compose.methods) // { fight: [Function: fight], cast: [Function: cast] }
```


## Status

* **v1**. `npm i stampit@1`
* **v2**. `npm i stampit@2` [Breaking changes](https://github.com/stampit-org/stampit/releases/tag/2.0)
* **v3**. `npm i stampit@3` [Breaking changes](https://github.com/stampit-org/stampit/releases/tag/v3.0.0). Compatible with the [stamp specification](https://github.com/stampit-org/stamp-specification) <= 1.4
* **v4**. `npm i stampit` [Breaking changes](https://github.com/stampit-org/stampit/releases/tag/v4.0.0). Compatible with the [stamp specification](https://github.com/stampit-org/stamp-specification) v1.5
* **next**. `npm i @stamp/it` The [new ecosystem](https://www.npmjs.com/~stamp/) of useful stamps like collision control, etc.


## Install

[![NPM](https://nodei.co/npm/stampit.png?compact=true)](https://www.npmjs.com/package/stampit)

## Compatibility

Stampit should run fine in any ES5 browser or any node.js.

## API

See https://stampit.js.org


# What's the Point?

Prototypal OO is great, and JavaScript's capabilities give us some really powerful tools to explore it, but it could be easier to use.

Basic questions like "how do I inherit privileged methods and private data?" and 
"what are some good alternatives to inheritance hierarchies?" are stumpers for many JavaScript users.

Let's answer both of these questions at the same time.

```js
// Some privileged methods with some private data.
const Availability = stampit({
  init() {
    let isOpen = false; // private

    this.open = function open() {
      isOpen = true;
      return this;
    };
    this.close = function close() {
      isOpen = false;
      return this;
    };
    this.isOpen = function isOpenMethod() {
      return isOpen;
    }
  }
});

// Here's a stamp with public methods, and some state:
const Membership = stampit({
  props: {
    members: {}
  },
  methods: {
    add(member) {
      this.members[member.name] = member;
      return this;
    },
    getMember(name) {
      return this.members[name];
    }
  }
});

// Let's set some defaults:
const Defaults = stampit({
  props: {
    name: "The Saloon",
    specials: "Whisky, Gin, Tequila"
  },
  init({ name, specials }) {
    this.name = name || this.name;
    this.specials = specials || this.specials;
  }
});

// Classical inheritance has nothing on this.
// No parent/child coupling. No deep inheritance hierarchies.
// Just good, clean code reusability.
const Bar = stampit(Defaults, Availability, Membership);

// Create an object instance
const myBar = Bar({ name: "Moe's" });

// Silly, but proves that everything is as it should be.
myBar.add({ name: "Homer" }).open().getMember("Homer");
```

For more examples see the [API](https://stampit.js.org) or the [Fun With Stamps](https://medium.com/@koresar/fun-with-stamps-episode-1-stamp-basics-e0627d81efe0) mini-blog series.

# Development

### Unit tests
```
npm t
```

### Unit and benchmark tests
```
env CI=1 npm t
```

### Unit tests in a browser
To run unit tests in a default browser:
```
npm run browsertest
```
To run tests in a different browser:
* Open the `./test/index.html` in your browser, and
* open developer's console. The logs should indicate success.

### Publishing to NPM registry
```bash
npx cut-release
```
It will run the `cut-release` utility which would ask you if you're publishing patch, minor, or major version. Then it will execute `npm version`, `git push` and `npm publish` with proper arguments for you.

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const test = require("tape");

test('infection works using the require("stampit")', (t) => {
  const obj = require("../stampit.js")
    .default() // eslint-disable-line global-require
    .init(function () {
      const secret = "foo";
      this.getSecret = () => {
        return secret;
      };
    })
    .methods({
      foo() {
        return "foo";
      },
    })
    .create();

  t.equal(obj.getSecret(), "foo", "Should create infected stamps with shortcuts");
  t.ok(obj.foo() === "foo", "Should create infected stamps from infected stamps with shortcuts");

  t.end();
});

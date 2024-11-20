const test = require("tape");

test('infection works using the require("src/stampit")', (t) => {
  const obj = require("../stampit.js")
    .default // eslint-disable-line global-require
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

  t.equal(
    obj.getSecret(),
    "foo",
    "Should create infected stamps with shortcuts",
  );
  t.ok(
    obj.foo() === "foo",
    "Should create infected stamps from infected stamps with shortcuts",
  );

  t.end();
});

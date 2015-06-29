'use strict';

Tinytest.add('stampit.name', function (test) {
  test.ok(stampit.name === 'stampit', {message: 'is stampit.name set'});
});
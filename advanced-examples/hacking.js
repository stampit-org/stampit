/* jshint newcap: false */
'use strict';
var stampit = require('../stampit');


var Stamp = stampit();
Stamp.fixed.methods.data = 1;
var instance = Stamp();
console.log(instance.data); // 1
var instance2 = Stamp({ data: 2 });
console.log(instance2.data); // 2
delete instance2.data;
console.log(instance2.data); // 1


// -----

var ForcedDefaults = stampit.init(function (ctx) {
  stampit.mixin(ctx.stamp.fixed.methods, this._enforcedDefaults);
});
var DefaultDbCredentials = ForcedDefaults.refs({ _enforcedDefaults: { user: { name: "guest", password: "guest" } } });
var DbConnection = stampit(); // whatever it is...
var DbConnectionWithDefaults = DbConnection.compose(DefaultDbCredentials);

var connectionWithoutCredentials = DbConnectionWithDefaults();
console.log(connectionWithoutCredentials.user);
var connectionWithCredentials = DbConnectionWithDefaults({ user: { name: "admin", password: "123" } });
console.log(connectionWithCredentials.user);

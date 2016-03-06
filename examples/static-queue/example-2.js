
var stampit = require('../../dist/stampit.js');

/*
    example of adding composer that runs before base composer
 */

var staticQueueComposer = {
        // named composer will not be duplicated every compose
        name: 'staticQueue',
        // run before the base composer
        sort: -1,
        compose: function (self, other) {
            console.log('static queue compose');

            var selfId = '';
            var selfQueue = [];
            if(self){
                selfId = self.static.id || '';
                selfQueue = self.static.queue || [];
            }

            var otherId = '';
            var otherQueue = [];
            if(other){
                otherId = other.static.id || '';
                otherQueue = other.static.queue || [];
            }

            console.log(' - self ', selfId, selfQueue);
            console.log(' - other ', otherId, otherQueue);

            console.log('');

            var q1 = [];
            var q2 = [];

            if(self && self.static.queue){
                q1 = self.static.queue;
            }

            if(other && other.static.queue){
                q2 = other.static.queue;
            }


            var q = q1.concat(q2);

            // set the merged queue on the `other` obect to be merged into self by base composer
            other.static.queue = q1.concat(q2);

            return self;
        }
    };

var StaticQueue = stampit({

    static: {
        id: 'X',
    },

    composers: [staticQueueComposer]

});

var A = stampit({
    static: {
        id: 'A',
        queue: [
            'a',
            'aa',
            'aaa',
        ],
    },
});


var B = stampit({
    static: {
        id: 'B',
        queue: [
            'b',
            'bb',
            'bbb',
        ],
    },
});

var C = stampit({
    static: {
        id: 'C',
        queue: [
            'c',
            'cc',
            'ccc',
        ],
    },
});

var X = StaticQueue.compose(A, B, C);

console.log('queue:', X.fixed.static.queue);


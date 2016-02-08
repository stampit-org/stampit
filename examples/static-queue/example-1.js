
var stampit = require('../../dist/stampit.js');

/*
    example of replacing the base composer for stamps.
 */

var staticQueueComposer = {
        // replaces base composer
        name: 'base',
        order: 0,
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

            // call the base stampit composer
            self = stampit.baseComposer.compose(self, other);

            self.static.queue = q;
            return self;

        }
    };

var StaticQueue = stampit({
    static: {
        id: 'X',
    },
    // must be added to replace base composer in every stamp
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
    // must be added to replace base composer in every stamp
    composers: [staticQueueComposer]
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
    // must be added to replace base composer in every stamp
    composers: [staticQueueComposer]
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
    // must be added to replace base composer in every stamp
    composers: [staticQueueComposer]
});

var X = StaticQueue.compose(A, B, C);

console.log('queue:', X.fixed.static.queue);


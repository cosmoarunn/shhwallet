/*
 *  block.js
 *  Package: shhwallet
 *
 *  Description : Bitcoin Block
 *  Author: Arun Panneerselvam
 *  email: aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */


const Block = (() => {
    let _Block = class {};
    let props = {
        hash            : null,
        confirmations   : null,
        strippedsize    : null,
        size            : null,
        weight          : null,
        height          : null,
        version         : null,
        versionHex      : null,
        merkleroot      : null,
        tx              : [],
        time            : null,
        mediantime      : null,
        nonce           : null,
        bits            : null,
        difficulty      : null,
        chainwork       : null,
        previoushash    : null,
        nexthash        : null,

    };
    for (let prop in props) {
        Object.defineProperty(_Block, prop, {
            get: function() {
                return props[prop];
            },
            set: function(newValue) {
                props[prop] = newValue;
            },
            enumerable: true
        });
    }

    var blockFromArray = function(bArray) {
        for (let prop in props) {
            props[prop] = bArray[prop];
        }
    }
    return _Block;
})();

//let block = new Block();
//block.hash = "000000000000000000ea38576905801253e4fff7079437cd954e94df13e4287e";
//console.log(block);

module.exports = Block;

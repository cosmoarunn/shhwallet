/*
 *  Wallet.js
 *  Package: shhwallet
 *
 *  Description : Bitcoind Wallet Routes..
 *  Author: Arun Panneerselvam
 *  email: arun@gsunitedtechnologies.com/aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */

var bitcoin  = require('bitcoinjs-lib');
var cs = require('coinstring');
var assert = require('assert')
var async = require('async')
var bigi = require('bigi')

var blockchain = require('./_blockchain')

var ecurve = require('ecurve')
var secp256k1 = ecurve.getCurveByName('secp256k1')


const network = {
    mainnet: 8332,
    regtest: 18332,
    testnet: 18332
}


function tester () {
    //this.timeout(30000)

    var inputs = [
      {
        txId: 'b95c6667e7ae0a7f4d8cbecc3623e42f76cccb2f02b9c9b13154193295756950',
        vout: 0
      },
      {
        txId: '355504aa996786c6f573f27f257ad198c0f27507cfa6cd0503a79449fac37ad6',
        vout: 1
      }
    ]

    var txIds = inputs.map(function (x) { return x.txId })

    // first retrieve the relevant transactions
    blockchain.m.transactions.get(txIds, function (err, results) {
        assert.ifError(err)

        var transactions = {}
        results.forEach(function (tx) {
            transactions[tx.txId] = bitcoin.Transaction.fromHex(tx.txHex)
        })

        var tasks = []

        // now we need to collect/transform a bit of data from the selected inputs
        inputs.forEach(function (input) {
            var transaction = transactions[input.txId]
            var script = transaction.ins[input.vout].script
            var scriptChunks = bitcoin.script.decompile(script)

            assert(bitcoin.script.pubKeyHash.input.check(scriptChunks), 'Expected pubKeyHash script')

            var prevOutTxId = [].reverse.call(new Buffer(transaction.ins[input.vout].hash)).toString('hex')
            var prevVout = transaction.ins[input.vout].index

            tasks.push(function (callback) {
                blockchain.m.transactions.get(prevOutTxId, function (err, result) {
                    if (err) return callback(err)

                    var prevOut = bitcoin.Transaction.fromHex(result.txHex)
                    var prevOutScript = prevOut.outs[prevVout].script

                    var scriptSignature = bitcoin.ECSignature.parseScriptSignature(scriptChunks[0])
                    var publicKey = bitcoin.ECPair.fromPublicKeyBuffer(scriptChunks[1])

                    var m = transaction.hashForSignature(input.vout, prevOutScript, scriptSignature.hashType)
                    assert(publicKey.verify(m, scriptSignature.signature), 'Invalid m')

                    // store the required information
                    input.signature = scriptSignature.signature
                    input.z = bigi.fromBuffer(m)

                    return callback()
                })
            })
        })

        // finally, run the tasks, then on to the math
        async.parallel(tasks, function (err) {
            if (err) throw err

            var n = secp256k1.n

            for (var i = 0; i < inputs.length; ++i) {
                for (var j = i + 1; j < inputs.length; ++j) {
                    var inputA = inputs[i]
                    var inputB = inputs[j]

                    // enforce matching r values
                    assert.strictEqual(inputA.signature.r.toString(), inputB.signature.r.toString())
                    var r = inputA.signature.r
                    var rInv = r.modInverse(n)

                    var s1 = inputA.signature.s
                    var s2 = inputB.signature.s
                    var z1 = inputA.z
                    var z2 = inputB.z

                    var zz = z1.subtract(z2).mod(n)
                    var ss = s1.subtract(s2).mod(n)

                    // k = (z1 - z2) / (s1 - s2)
                    // d1 = (s1 * k - z1) / r
                    // d2 = (s2 * k - z2) / r
                    var k = zz.multiply(ss.modInverse(n)).mod(n)
                    var d1 = ((s1.multiply(k).mod(n)).subtract(z1).mod(n)).multiply(rInv).mod(n)
                    var d2 = ((s2.multiply(k).mod(n)).subtract(z2).mod(n)).multiply(rInv).mod(n)

                    // enforce matching private keys
                    console.log(d1.toString(), d2.toString())
                }
            }


        })

    });

    }



tester();



for(var i=0; i<2; i++) {
    var keyPair = bitcoin.ECPair.makeRandom()

// Print your private key (in WIF format)
var kpWIF = keyPair.toWIF();
// => Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct

// Print your public key address
var kpAddr = keyPair.getAddress();
// => 14bZ7YWde4KdRb5YN7GYkToz3EHVCvRxkF

    console.log({'WIF': kpWIF, Address: kpAddr});
}



var hash160 = "92f669ed2ccb5493ad8e48bfced324f28b2d4dd1" //hash representing uncompressed
var hash160Buf = new Buffer(hash160, 'hex')
var version = 0x00; //Bitcoin public address

//console.log(cs.encode(hash160Buf, version));

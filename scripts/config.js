/**
 * Services config.
*/
function getHost(name) {
  return process.env.CI === 'true' ? name : '127.0.0.1';
}

/*
 * Configuration
 */
const config = {
  bitcoind: {
    network: 'testnet',  //or mainnet
    host: getHost('bitcoind'),
    pass: 'terrificLion593',
    password: 'terrificLion593',
    port:   8332,
    user: '426800@shhwallet',
    username: '426800@shhwallet',
  },
  bitcoindtest: {
    network: 'testnet',
    host: getHost('bitcoind'),
    user: '426800@shhwallet',
    pass: 'terrificLion593',
    port: 18333,
    password: 'terrificLion593',
    username: '426800@shhwallet',
  },
  bitcoindSsl: {
    host: 'localhost',
    pass: 'terrificLion593',
    port: 18334,
    username: '426800@shhwallet'
  },
  bitcoindUsernameOnly: {
    host: 'localhost',
    port: 18335,
    username: '426800@shhwallet'
  },
  api: {
    'name' : 'shhAPI',
    'secret': '9mu2L4VeiWkPLXEoWAbvwzb-nyw6eA2NY1gUgNR33Adqec1PHzFLomeYhFD6whq4ieWpHAwF1WeZgFCqpd6o8W00054587Q',
    'database': 'mongodb://shhwallet:terrificLion593@127.0.0.1:27017/shhwallet',            //Mongodb URI
    'auth_duration' : 600,                                                                            //seconds
    'auth_uri' : 'auth',
    'min_conf' : 3,
  },
  site: {
    origin : 'https://arunpanneerselvam.com', //set your origin site
  },



};

/**
 * Export `config`.
 */




module.exports = config;
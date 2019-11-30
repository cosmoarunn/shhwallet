# ShhWallet - Node.JS Bitcoin Wallet

ShhWallet is a Node.JS javascript library built on bitcoinjs-lib and express to provide api services through bitcoin rpc client
Assuming bitcoind & bitcoin-cli is running in local server,

## Server - minimum requirements
1. Ubuntu 16.04 LTS (Xenial)
2. Bitcoin Core version v0.18.0.0-g2472733a24a9364e4c6233ccd04166a26a68cc65 (release build)
3. Node.js v10.17.0 (node -v)
4. npm 6.11.3 (npm --version)

## Installation
```bash
1. Run sudo git clone git@github.com:cosmoarunn/shhwallet.git  
   - if facing 'permission denied' error, try git clone https://github.com/cosmoarunn/shhwallet
2. cd shhwallet
3. Run npm install
```



##MongoDB Installation
shhwallet uses mongodb and mongoose. If mongodb is not installed visit,
https://docs.mongodb.com/manual/installation/

#Installation instructions:
Mongodb server version 4.2

```bash
1. wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -  
   - the operation should return OK
2. sudo apt-get install gnupg
3. wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
   - the operation should return OK
4. sudo apt-get update
5. sudo service mongod start 
   - Start mongodb 
6. sudo service mongod status
   - verify mongodb started
7. mongo
   - start mongo commandline

#Create MongoDB database with username and password
use mydb
db.createUser(
   {
     user: "yourusername",
     pwd: "yourpassword",
     roles: [ "dbOwner" ]
   }
)

- once done, `quit` mongo shell and update credentials to file config.js
 `shhwallet/scripts/config.js` 



```
Use the Node package manager [npm](https://www.npmjs.com/) to install shhwallet.

```bash
npm install shhwallet
```

## Usage

```Node.JS
const wallet = require('shhwallet');

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
File : License.MD 
[MIT](https://arunpanneerselvam.com/licenses/mit/)

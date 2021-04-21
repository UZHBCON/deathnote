require('dotenv').config();
const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: (process.env.PORT || 8545)
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, process.env.ROPSTEN_API)
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
  }
};

var DeathNote = artifacts.require("./DeathNote.sol");
const config = require("../deathnote_config.json");

module.exports = function(deployer) {
  deployer.deploy(
      DeathNote,
      config['validators'],
      config['beneficiaries'],
      config['shares'],
      config['confirmationsRequired'],
      config['waitingPeriodDays']
  )
};

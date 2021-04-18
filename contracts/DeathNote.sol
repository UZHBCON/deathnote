// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract DeathNote {
  address public owner;
  uint start;
  uint end;
  uint totalInheritors = 0;
  uint totalVoters = 0;
  uint amount = 0;
  uint freezedAmount = 0; // after death confirmation
  enum decision{DEATH, ALIVE, VOTELESS}

  mapping (uint => address) inheritors;
  mapping (address => uint) weights;
  mapping (uint => address) voters;
  mapping (address => decision) deathConfirmations;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    require (
      msg.sender == owner,
      "Not authorized."
    );
    _;
  }

  modifier isValidRecipient() {
    require(
      weights[msg.sender] != 0, // if key not exists, default uint value (0) is set
      "Not allowed to withdraw money"
    );
    _;
  }

  modifier isValid() {
    require(
      end - start > 60,
      "Required 60 days have not yet passed."
    );
    _;
  }

  function fund() public payable restricted {
    amount += msg.value;
    freezedAmount = amount;
  }

  function withdrawOwner(uint val) public restricted {
    if (amount >= val) {
      msg.sender.transfer(val);
      amount -= val;
      freezedAmount = amount;
    }
  }

  function withdrawInheritor() public isValidRecipient isValid {
    uint weightedAmount = freezedAmount * weights[msg.sender] / 100;

    if (amount >= weightedAmount) {
      msg.sender.transfer(weightedAmount);
      amount -= weightedAmount;
    }
  }

  function balance() public view returns (uint) {
    return amount;
  }

  function deathConfirmation() public {
      // TODO: use MultiSig and send events to all participants
      freezedAmount = amount;
      start = block.timestamp;
  }

  function setInheritor(address addr, uint weight) public restricted {
    inheritors[totalInheritors++] = addr;
    weights[addr] = weight;
  }
  
  function removeInheritor(address addr) public restricted {
      weights[addr] = 0; // inheritor gets nothing
  }

  function getAllInheritors() public view returns (address[] memory, uint[] memory) {
    address[] memory tmpAddrs = new address[](totalInheritors);
    uint[] memory tmpWeights = new uint[](totalInheritors); 

    for(uint i = 0; i < totalInheritors; i++) {
      tmpAddrs[i] = inheritors[i];
      tmpWeights[i] = weights[inheritors[i]];
    }
    return (tmpAddrs, tmpWeights);
  }

  function getWeight(address addr) public view returns (uint) {
    return weights[addr];
  }

  function setVoter(address addr) public restricted {
    voters[totalVoters++] = addr;
    deathConfirmations[addr] = decision.ALIVE; // default: alive
  }
  
  function removeVoter(address addr) public restricted {
      deathConfirmations[addr] = decision.VOTELESS; // voter lost right to vote
  }
}

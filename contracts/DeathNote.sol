// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

// Possible improvements
// 1) Allow validators to revoke confirmation as long as m is not reached (afterward not possible anymore)
// 2) Add function to replace beneficiaries (-> only allow replacing entire array to avoid recalculating of shares?)
// 3) Add events

contract DeathNote {
    // Structs to track behaviour of participants
    struct validatorState {
        bool isValidator;
        bool hasConfirmed;
    }
    
    struct beneficiaryState {
        bool isBeneficiary;
        uint share;
        bool shareClaimed;
    }
    
    // State variables
	address payable public creator;
	// arrays are needed since mappings are virtually initialised (-> see Solidity docs)
	address[] public trackValidators;
	address[] public trackBeneficiaries;
	uint public confirmationsRequired;
	uint public waitingPeriodDays;
	uint public balance;
	uint public balanceFrozen;
	bool public firstClaim = true;
	
	uint public numConfirmations;
	mapping(address => validatorState) validators;
	mapping(address => beneficiaryState) beneficiaries;
	
	uint public deadline;
	bool public testamentRevoked;

    // Events
	event Deposit(address indexed sender, uint amount, uint balance);
	event ConfirmDeath(address indexed owner);
	event RevokeTestament(address indexed creator);

    // Modifiers	
	modifier onlyCreator() {
	    require(msg.sender == creator, "Only creator is allowed to call this function");
	    _;
	}
	
	modifier onlyValidator() {
	    require(validators[msg.sender].isValidator, "Sender is not a legitimate validator");
	    _;
	}
	
	modifier onlyBeneficiary() {
	    require(beneficiaries[msg.sender].isBeneficiary, "You are not a beneficiary");
	    _;
	}
	
	modifier notConfirmed() {
	    require(!validators[msg.sender].hasConfirmed, "Confirmation already submitted");
	    _;
	}
	
	modifier deathConfirmed() {
	    require(deadline != 0, "No confirmed death yet");
	    require(now >= deadline, "Waiting period has not ended yet");
	    require(testamentRevoked == false, "Testament has been revoked");
	    _;
	}
	
	// Idea: only allow creator to submit txs up to the end of the waiting period. Afterwards, block funds for beneficiaries
	modifier deathNotConfirmed() {
	    require(deadline == 0 || now < deadline, "Waiting period has been exceeded, no more tx possible");
	    _;
	}
	
	modifier shareNotClaimed() {
	    require(!beneficiaries[msg.sender].shareClaimed, "Share already claimed");
	    _;
	}
	
	modifier notRevoked() {
	    require(testamentRevoked == false, "Testament already revoked");
	    _;
	}
	
	constructor(address[] memory _validators, address[] memory _beneficiaries, uint[] memory _shares, uint _confirmationsRequired, uint _waitingPeriodDays) public payable {
	    require(_validators.length > 0, "Validators required");
	    require(_beneficiaries.length > 0, "Beneficiaries required");
	    require(_beneficiaries.length == _shares.length, "Share for every beneficiary required");
	    require(_confirmationsRequired > 0 && _confirmationsRequired <= _validators.length, "Invalid number of required confirmations");

        uint sumShares = 0;
        for(uint i=0; i<_shares.length; i++) {
            sumShares += _shares[i];
        }
        require(sumShares == 100, "Sum of all shares must add up to 100");

	    for(uint i=0; i<_validators.length; i++) {
	        address validator = _validators[i];
	        
	        // prevent zero address and duplicates
	        require(validator != address(0), "Invalid validator");
	        require(!validators[validator].isValidator, "Non-unique validator");
	        validators[validator].isValidator = true;
	        trackValidators.push(validator);
	    }
	    
	    for(uint i=0; i<_beneficiaries.length; i++) {
	        address beneficiary = _beneficiaries[i];
	        
	        // prevent zero address and duplicates
	        require(beneficiary != address(0), "Invalid beneficiary");
	        require(!beneficiaries[beneficiary].isBeneficiary, "Non-unique beneficiary");
	        beneficiaries[beneficiary].isBeneficiary = true;
	        beneficiaries[beneficiary].share = _shares[i];
	        trackBeneficiaries.push(beneficiary);
	    }
	    
	    confirmationsRequired = _confirmationsRequired;
		creator = msg.sender;
		balance = msg.value;
		deadline = 0;
		waitingPeriodDays = _waitingPeriodDays;
	}

    // NOTE -> Change time unit to days for a shipping version (seconds for demonstration purposes)
	function confirmDeath() public onlyValidator notConfirmed {
	    validators[msg.sender].hasConfirmed = true;
	    numConfirmations += 1;
	    emit ConfirmDeath(msg.sender);
	    
	    if (numConfirmations == confirmationsRequired) {
	        deadline = now + (waitingPeriodDays * 1 seconds);
	    }
	}
	
	function claimInheritanceShare() public onlyBeneficiary deathConfirmed shareNotClaimed {
	    // Idea: Every beneficiary needs to claim its share on its own

	    if (firstClaim) {
	        require(balance != 0, "No inheritance left");
	        balanceFrozen = balance;
	        firstClaim = false;
	    }
	    
	    // Use of withdrawal pattern for security reasons (see Solididty docs)
	    uint amount = (beneficiaries[msg.sender].share * balanceFrozen) / 100;
	    balance -= amount;
	    msg.sender.transfer(amount);
	    beneficiaries[msg.sender].shareClaimed = true;
	}
	
	function revokeTestament() public onlyCreator deathNotConfirmed notRevoked {
	    testamentRevoked = true;
	    // prevention of re-entry attackes (see Solidity docs)
	    uint amount = balance;
	    balance = 0;
	    creator.transfer(amount);
	}
	
	function deposit() public payable onlyCreator deathNotConfirmed notRevoked {
	    require(msg.value > 0, "Specify amount to deposit in tx");
	    balance += msg.value;
	}
	
	function withdraw(uint _amount) public onlyCreator deathNotConfirmed notRevoked {
	    require(_amount <= balance, "Balance not sufficient");
	    balance -= _amount;
	    creator.transfer(_amount);
	}
}
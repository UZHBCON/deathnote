// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

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
    event ConfirmDeath(address indexed sender);
    event ClaimShare(address indexed sender, uint amount);
    event RevokeTestament(address indexed creator);
    event Deposit(address indexed sender, uint amount, uint newBalance);
    event Withdrawal(address indexed sender, uint amount, uint newBalance);
    event ReplaceValidators(address indexed sender, address[] newValidators, uint newConfReq);
    event ReplaceBeneficiaries(address indexed sender, address[] newBeneficiaries, uint[] newShares);


    // Modifiers
    modifier validValidators(address[] memory _Validators, uint _ConfReq) {
        require(_Validators.length > 0, "Validators required");
        require(_ConfReq > 0 && _ConfReq <= _Validators.length, "Invalid number of required confirmations");
        _;
    }
    
    modifier validBeneficiaries(address[] memory _Beneficiaries, uint[] memory _Shares) {
        require(_Beneficiaries.length > 0, "Beneficiaries required");
	    require(_Beneficiaries.length == _Shares.length, "Share for every beneficiary required");
	    uint sumShares = 0;
        for(uint i=0; i<_Shares.length; i++) {
            sumShares += _Shares[i];
        }
        require(sumShares == 100, "Sum of all shares must add up to 100");
	    _;
    }
    
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
	require(testamentRevoked == false, "Testament has been revoked");
	_;
    }
	
    constructor(
		address[] memory _validators,
		address[] memory _beneficiaries,
		uint[] memory _shares,
		uint _confirmationsRequired,
		uint _waitingPeriodDays
	) public payable validValidators(_validators, _confirmationsRequired) validBeneficiaries(_beneficiaries, _shares) {
	    
	for(uint i=0; i<_validators.length; i++) {
	    address validator = _validators[i];
	    // prevent zero address
	    require(validator != address(0), "Invalid validator");
	    // not placed in modifier to allow replacements
	    require(!validators[validator].isValidator, "Non-unique validator");
	    validators[validator].isValidator = true;
	    trackValidators.push(validator);
	}
	    
	for(uint i=0; i<_beneficiaries.length; i++) {
	    address beneficiary = _beneficiaries[i];
	    // prevent zero address and duplicates
	    require(beneficiary != address(0), "Invalid beneficiary");
	    // not placed in modifier to allow replacements
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
	emit ClaimShare(msg.sender, amount);
    }
	
    function revokeTestament() public onlyCreator deathNotConfirmed notRevoked {
	testamentRevoked = true;
	// prevention of re-entry attackes (see Solidity docs)
	uint amount = balance;
	balance = 0;
	creator.transfer(amount);
	emit RevokeTestament(msg.sender);
    }
	
    function deposit() public payable onlyCreator deathNotConfirmed notRevoked {
	require(msg.value > 0, "Specify amount to deposit in tx");
	balance += msg.value;
	emit Deposit(msg.sender, msg.value, balance);
    }
	
    function withdraw(uint _amount) public onlyCreator deathNotConfirmed notRevoked {
	require(_amount <= balance, "Balance not sufficient");
	balance -= _amount;
	creator.transfer(_amount);
	emit Withdrawal(msg.sender, _amount, balance);
    }
	
    // idea: give the creator a cheaper alternative to revoking the testament in case of malicious behaviour
    function replaceValidators(address[] memory _newValidators, uint _newConfReq) public onlyCreator deathNotConfirmed notRevoked validValidators(_newValidators, _newConfReq) {
	// delete existing validators
	for(uint i=0; i<trackValidators.length; i++) {
	    delete validators[trackValidators[i]];
	}
	    
	uint bound = trackValidators.length;
	for(uint i=0; i<bound; i++) {
	    trackValidators.pop();
	}
	    
	// reset state variables
	numConfirmations = 0;
	deadline = 0;
	    
	// add newe validators
	for(uint i=0; i<_newValidators.length; i++) {
	    address validator = _newValidators[i];
	    // prevent zero address and duplicates
	    require(validator != address(0), "Invalid validator");
	    require(!validators[validator].isValidator, "Non-unique validator");
	    validators[validator].isValidator = true;
	    trackValidators.push(validator);
	}
	    
	confirmationsRequired = _newConfReq;
	emit ReplaceValidators(msg.sender, _newValidators, _newConfReq);
    }
	
    function replaceBeneficiaries(address[] memory _newBeneficiaries, uint[] memory _newShares) public onlyCreator deathNotConfirmed notRevoked validBeneficiaries(_newBeneficiaries, _newShares) {
	// idea: only allow replacing beneficiaries if no vote has been submitted yet (-> remind creator about potential malicious behaviour)
	require(numConfirmations == 0, "Votes have been submitted, consider replacing validators first");
	// delete existing beneficiaries
	for(uint i=0; i<trackBeneficiaries.length; i++) {
	    delete beneficiaries[trackBeneficiaries[i]];
	}
	    
	uint bound = trackBeneficiaries.length;
	for(uint i=0; i<bound; i++) {
	    trackBeneficiaries.pop();
	}
	    
	// add new beneficiaries
	for(uint i=0; i<_newBeneficiaries.length; i++) {
	    address beneficiary = _newBeneficiaries[i];
	    // prevent zero address and duplicates
	    require(beneficiary != address(0), "Invalid beneficiary");
	    require(!beneficiaries[beneficiary].isBeneficiary, "Non-unique beneficiary");
	    beneficiaries[beneficiary].isBeneficiary = true;
	    beneficiaries[beneficiary].share = _newShares[i];
	    trackBeneficiaries.push(beneficiary);
	}
	emit ReplaceBeneficiaries(msg.sender, _newBeneficiaries, _newShares);
    }

	function getAllValidators() public view returns (address[] memory, bool[] memory) {
        bool[] memory conf_arr = new bool[](trackValidators.length);
		for (uint i = 0; i < trackValidators.length; i++) {
			conf_arr[i] = validators[trackValidators[i]].hasConfirmed;
		}
		return (trackValidators, conf_arr);
    }

	function getAllBeneficiaries() public view returns (address[] memory, uint[] memory) {
		uint[] memory share_arr = new uint[](trackBeneficiaries.length);
		for (uint i = 0; i < trackBeneficiaries.length; i++) {
			share_arr[i]  = beneficiaries[trackBeneficiaries[i]].share;
		}
		return (trackBeneficiaries, share_arr);
	}
}

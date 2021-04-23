pragma solidity ^0.6.0;

// Possible improvements
// 1) handling invalid beneficiary addresses (i.e. if a tx gets reverted)
// 2) Do we really need dynamic arrays with the validators and the beneficiaries? Shouldn't a mapping to the job?
// 3) Allow validators to revoke confirmation as long as m is not reached (afterward not possible anymore)
// 4) Add function to replace beneficiaries (-> only allow replacing entire array to avoid recalculating of shares?)

contract DeathNote {
    
    // State variables
	address payable public creator;
	address[] public validators;
	address[] public beneficiaries;
	uint confirmationsRequired;
	uint public waitingPeriodDays;
	uint public balance;
	
	uint public numConfirmations;
	mapping(address => bool) isValidator;
	mapping(address => bool) isConfirmed;
	mapping(address => bool) isBeneficiary;
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
	    require(isValidator[msg.sender], "Sender is not a legitimate validator");
	    _;
	}
	
	modifier onlyBeneficiary() {
	    require(isBeneficiary[msg.sender], "You are not a beneficiary");
	    _;
	}
	
	modifier notConfirmed() {
	    require(!isConfirmed[msg.sender], "Confirmation already submitted");
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

	constructor(address[] memory _validators, address[] memory _beneficiaries, uint _confirmationsRequired, uint _waitingPeriodDays) public payable {
	    require(_validators.length > 0, "Validators required");
	    require(_beneficiaries.length > 0, "Beneficiaries required");
	    require(_confirmationsRequired > 0 && _confirmationsRequired <= _validators.length, "Invalid number of required confirmations");
	    
	    for(uint i=0; i<_validators.length; i++) {
	        address validator = _validators[i];
	        
	        // prevent zero address and duplicates
	        require(validator != address(0), "Invalid validator");
	        require(!isValidator[validator], "Non-unique validator");
	        isValidator[validator] = true;
	        validators.push(validator);
	    }
	    
	    for(uint i=0; i<_beneficiaries.length; i++) {
	        address beneficiary = _beneficiaries[i];
	        require(beneficiary != address(0), "Invalid beneficiary");
	        require(!isBeneficiary[beneficiary], "Non-unique beneficiary");
	        isBeneficiary[beneficiary] = true;
	        beneficiaries.push(beneficiary);
	    }
	    
	    confirmationsRequired = _confirmationsRequired;
		creator = msg.sender;
		balance = msg.value;
		deadline = 0;
		waitingPeriodDays = _waitingPeriodDays;
	}

    // TODO -> Change time unit to days
	function confirmDeath() public onlyValidator notConfirmed {
	    isConfirmed[msg.sender] = true;
	    numConfirmations += 1;
	    emit ConfirmDeath(msg.sender);
	    
	    if (numConfirmations == confirmationsRequired)
	        deadline = now + (waitingPeriodDays * 1 seconds);
	}
	
	function claimInheritanceShare() public onlyBeneficiary deathConfirmed {
	    // Idea: Every beneficiary needs to claim its share on its own
	    // NOTE: Use withdrawal pattern for security reasons (see solididty docs -> in case beneficiary is a SC with a messed up receive function)
	    
	    
	}
	
	function revokeTestament() public onlyCreator deathNotConfirmed {
	    require(testamentRevoked == false, "Testament already revoked");
	    testamentRevoked = true;
	    // prevention of re-entry attackes (see Solidity docs)
	    uint amount = balance;
	    balance = 0;
	    creator.transfer(amount);
	}
	
	function deposit() public payable onlyCreator deathNotConfirmed {
	    balance += msg.value;
	}
	
	function withdraw(uint _amount) public onlyCreator deathNotConfirmed {
	    require(_amount <= balance, "Balance not sufficient");
	    balance -= _amount;
	    creator.transfer(_amount);
	}
}
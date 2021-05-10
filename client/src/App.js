import React, {useEffect, useState} from "react";
import DeathNoteContract from "./contracts/DeathNote.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import "./App.sass";
import logo from './images/logo.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faBookDead, faMoneyBillWave, faBan, faExchangeAlt} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import Table from "./components/Table"

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState(0);
    const [validators, setValidatorsState] = useState(null);
    const [beneficiaries, setBeneficiariesState] = useState(null);
    const [creator, setCreator] = useState('');
    const [isCreator, setIsCreator] = useState(false);
    const [isBeneficiary, setIsBeneficiary] = useState(false);
    const [isValidator, setIsValidator] = useState(false);
    const [inputAmount, setInputAmount] = useState(0);

    useEffect(() => {
      async function setupWeb3() {
        try {
          // Get network provider and web3 instance.
          const web3 = await getWeb3();

          // Use web3 to get the user's accounts.
          const accounts = await web3.eth.getAccounts();

          // Get the contract instance.
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = DeathNoteContract.networks[networkId];

          const instance = new web3.eth.Contract(
              DeathNoteContract.abi,
              deployedNetwork && deployedNetwork.address,
          );

          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          setWeb3(web3);
          setAccounts(accounts);
          setContract(instance);
          setAddress(instance.options.address);
          setCreator(await instance.methods.creator().call());
          setBalance(await instance.methods.balance().call());
          setParticipants(instance);
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
              `Failed to load web3, accounts, or contract. Check console for details.`,
          );
          console.error(error);
        }
      }
      setupWeb3();
    });

    useEffect(() => {
        async function initUser() {
            if (validators != null && beneficiaries != null) {

                console.log(Object.entries(validators))

                // set specific user from account number
                if (accounts[0] === creator) {
                    setIsCreator(true);
                } 

                if (Object.keys(validators).includes(accounts[0])) {
                    setIsValidator(true);
                } 

                if (Object.keys(beneficiaries).includes(accounts[0])) {
                    setIsBeneficiary(true);
                }
            }
        }
        initUser();
    }, [validators, beneficiaries]);


    const setParticipants = async (instance) => {
        let val_arr = await instance.methods.getAllValidators().call();
        let ben_arr = await instance.methods.getAllBeneficiaries().call();


        let tmp = {}
        for (var i = 0; i < val_arr[0].length; i++) {
            tmp[val_arr[0][i]] = val_arr[1][i];
        }
        setValidatorsState(tmp)

        tmp = {}
        for (i = 0; i < ben_arr[0].length; i++) {
            tmp[ben_arr[0][i]] = ben_arr[1][i];
        }
        setBeneficiariesState(tmp)
    }

    const confirmDeath = async () => {
        setIsLoading(true);
        try {
            await contract.methods.confirmDeath().send({from: accounts[0]});
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false);
        }
    };

    const claimInheritanceShare = async () => {
        setIsLoading(true);
        try {
            await contract.methods.claimInheritanceShare().send({from: accounts[0]});
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false);
        }
    };

    const revokeTestament = async () => {
        setIsLoading(true);
        try {
            await contract.methods.revokeTestament().send({from: accounts[0]});
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false);
        }
    };

    const withdraw = async () => {
        setIsLoading(true);
        try {
            await contract.methods.withdraw(inputAmount).send({from: accounts[0]});
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false);
        }
    };

    const deposit = async () => {
        setIsLoading(true);
        try {
            await contract.methods.deposit().send({from: accounts[0], value: inputAmount});
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <h1>Please wait while processing transaction...</h1>
    }

    if (!web3) {
        return <h1>Loading Web3, accounts, and contract...</h1>;
    }
    return (

      <section className="hero is-black is-fullheight">
        <div className="hero-head">
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-brand">
                        <a className="navbar-item" href="../">
                        <img src={logo} alt="Logo"/>
                        </a>
                        <span className="navbar-burger burger" data-target="navbarMenu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </div>
                <div id="navbarMenu" className="navbar-menu">
                    <div className="navbar-end">
                        <span className="navbar-item">
                            <a className="button is-white" href="../">
                                <span className="icon">
                                    <FontAwesomeIcon icon={faHome} />
                                </span>
                                <span>Home</span>
                            </a>
                        </span>
                        <span className="navbar-item">
                            
                            <a className="button is-white" href="https://github.com/UZHBCON/deathnote">
                                <span className="icon">
                                    <FontAwesomeIcon icon={faGithub} />
                                </span>
                                <span>View Source</span>
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    </div>

    <div className="hero-body">
        <div className="container">
                <h1 className="title">
                    Contract
                </h1>
                <div className="columns is-gapless">
                    <div className="column is-2">
                        <p className="mr-2">Contract Address:</p>
                    </div>
                    <div className="control column">
                        <input className="input is-large" style={{width: 400}} type="text" value={address} disabled></input>
                    </div>
                    <div className="column is-2">
                        <p className="mr-2">Creator Address:</p>
                    </div>
                    <div className="control column">
                        <input className="input is-large" style={{width: 400}} type="text" value={creator} disabled></input>
                    </div>
                </div>
                <div className="columns is-gapless">
                    <div className="column is-2">
                            <p className="mr-2">Amount (Wei):</p>
                        </div>
                        <div className="control column">
                            <input className="input is-large" style={{width: 400}} type="text" value={inputAmount} onChange={e => setInputAmount(e.target.value)}></input>
                    </div>
                    <div className="column is-2">
                        <p className="mr-2">Balance (Wei):</p>
                    </div>
                    <div className="control column">
                        <input className="input is-large" style={{width: 400}} type="text" value={balance} disabled></input>
                    </div>
                </div>
                <div className="controls mb-4">
                    {isCreator &&
                            <div className="controls mb-4">
                                 <a className="button is-white mr-2" onClick={deposit}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                    </span>
                                    <span>Deposit</span>
                                </a>
                                <a className="button is-white mr-2" onClick={withdraw}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                    </span>
                                    <span>Withdraw</span>
                                </a>
                                <a className="button is-white mr-2" onClick={revokeTestament}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faBan} />
                                    </span>
                                    <span>Revoke Contract</span>
                                </a>
                                <a className="button is-white mr-2" onClick={revokeTestament}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faExchangeAlt} />
                                    </span>
                                    <span>Replace Voters</span>
                                </a>
                                <a className="button is-white mr-2" onClick={revokeTestament}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faExchangeAlt} />
                                    </span>
                                    <span>Replace Beneficiaries</span>
                                </a>
                            </div>
                    }

                    {isValidator && 
                        <a className="button is-white mr-2" onClick={confirmDeath}>
                            <span className="icon">
                                <FontAwesomeIcon icon={faBookDead} />
                            </span>
                            <span>Confirm Death</span>
                        </a>
                    }
                    {isBeneficiary &&
                        <a className="button is-white mr-2" onClick={claimInheritanceShare}>
                            <span className="icon">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                            </span>
                            <span>Claim Inheritance Share</span>
                        </a>
                    }
                </div>
                {isCreator && 
                    <div>
                        <table className="table is-hoverable is-fullwidth">
                            <thead>
                                <tr>
                                    <th>Voters</th>
                                    <th>Death Confirmed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                Object.entries(validators).map(row => {
                                    return (
                                        <tr>
                                            <td >{row[0]}</td>
                                            <td>{row[1] ? "true" : "false"}</td>
                                        </tr>
                                    )})
                                }
                            </tbody>    
                        </table>

                        <table className="table is-hoverable is-fullwidth">
                            <thead>
                                <tr>
                                    <th>Benficiaries</th>
                                    <th>Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                Object.entries(beneficiaries).map(row => {
                                    return (
                                        <tr>
                                            <td>{row[0]}</td>
                                            <td>{row[1]}</td>
                                        </tr>
                                    )})
                                }
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    </section>
  );
}

export default App;

import React, {useEffect, useState} from "react";
import DeathNoteContract from "./contracts/DeathNote.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import "./App.sass";
import logo from './images/logo.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faBookDead, faMoneyBillWave, faBan, faUserEdit, faPiggyBank, faSkull, faHeart} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';

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
  const [inputAddresses, setInputAddresses] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [deathConfirmed, setDeathConfirmed] = useState('false');
  const [testamentRevoked, setTestamentRevoked] = useState('false');
  const [deadline, setDeadline] = useState(0);

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

        // set states
        setIsLoading(true);
        setWeb3(web3);
        setAccounts(accounts);
        setContract(instance);
        setAddress(instance.options.address);
        setCreator(await instance.methods.creator().call());
        setBalance(await instance.methods.balance().call());
        setDeathConfirmed(await instance.methods.deathIsConfirmed().call());
        setDeadline(new Date(await (instance.methods.deadline().call()) * 1000).toString());
        setTestamentRevoked(await instance.methods.testamentRevoked().call());
        setParticipants(instance);
        setIsLoading(false);

        // catch all events and re-load page
        instance.events.allEvents({fromBlock: 'latest'}, function(error, event) {
          if (error) {
            console.error(error)
          } else {
            console.log("Event: " + event.event)
            window.location.reload()
          }
        })
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    setupWeb3();
  },[]);

  useEffect(() => {
    async function initUser() {
      if (validators != null && beneficiaries != null) {

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
  });


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

  const replaceValidators = async () => {
    setIsLoading(true);
    try {
      await contract.methods.replaceValidators(inputAddresses.split(','), inputValue).send({from: accounts[0]});
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoading(false);
    }
  };

  const replaceBeneficiaries = async () => {
    setIsLoading(true);
    try {
      await contract.methods.replaceBeneficiaries(inputAddresses.split(','), inputValue.split(',')).send({from: accounts[0]});
    } catch (e) {
        console.error(e)
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <section className="hero is-black is-fullheight">
      { isLoading || !web3 ? (
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-half">
                <div className="loader spinner"/>
              </div>
            </div>
          </div>
        ) : (
          <div>
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
                  { deathConfirmed ? (
                      <div style={{display: 'flex'}}>
                        <div>Dead</div>
                        <FontAwesomeIcon className="death ml-4" icon={faSkull} />
                      </div>
                    ) : (
                        <div style={{display: 'flex'}}>
                          <div>Alive</div>
                          <FontAwesomeIcon className="alive ml-4" icon={faHeart} />
                        </div>
                    )
                  }
                  { testamentRevoked && (
                      <FontAwesomeIcon className="death ml-4" icon={faBan} />
                    )
                  }
                </h1>
                { deathConfirmed &&
                  <h2 className="subtitle">Deadline: {deadline}</h2> 
                }
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
                  { isCreator &&
                    <div className="columns is-gapless">
                      <div className="column is-2">
                        <p className="">Amount (Wei):</p>
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
                  }
                  { isCreator && !deathConfirmed &&
                    <div className="columns is-gapless">
                      <div className="column is-2">
                        <p className="mr-2">Addresses:</p>
                      </div>
                      <div className="control column">
                        <input className="input is-large" placeholder="Address1, Address2, ..." style={{width: 400}} type="text" value={inputAddresses} onChange={e => setInputAddresses(e.target.value)}></input>
                      </div>
                      <div className="column is-2">
                        <p className="mr-2">Shares / Confirmations:</p>
                      </div>
                      <div className="control column">
                        <input className="input is-large" placeholder="Share1, Share2, ..." style={{width: 400}} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}></input>
                      </div>
                    </div>
                    }
                    <div className="controls mb-4">
                      { isCreator &&
                        <div className="controls mb-4">
                            <button className="button is-white mr-2" onClick={deposit} disabled={deathConfirmed}>
                              <span className="icon">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                              </span>
                              <span>Deposit</span>
                            </button>
                            <button className="button is-white mr-2" onClick={withdraw}>
                              <span className="icon">
                                <FontAwesomeIcon icon={faPiggyBank} />
                              </span>
                              <span>Withdraw</span>
                            </button>
                            <button className="button is-white mr-2" onClick={revokeTestament} disabled={deathConfirmed}>
                              <span className="icon">
                                  <FontAwesomeIcon icon={faBan} />
                              </span>
                              <span>Revoke Contract</span>
                            </button>
                            <button className="button is-white mr-2" onClick={replaceValidators} disabled={deathConfirmed}>
                              <span className="icon">
                                <FontAwesomeIcon icon={faUserEdit} />
                              </span>
                              <span>Replace Validators</span>
                            </button>
                            <button className="button is-white mr-2" onClick={replaceBeneficiaries} disabled={deathConfirmed}>
                              <span className="icon">
                                <FontAwesomeIcon icon={faUserEdit} />
                              </span>
                              <span>Replace Benficiaries</span>
                            </button>
                          </div>
                        }
                        { isValidator &&
                          <button className="button is-white mr-2" onClick={confirmDeath} disabled={deathConfirmed}>
                            <span className="icon">
                              <FontAwesomeIcon icon={faBookDead} />
                            </span>
                            <span>Confirm Death</span>
                          </button>
                        }
                        { isBeneficiary &&
                          <button className="button is-white mr-2" onClick={claimInheritanceShare}>
                            <span className="icon">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                            </span>
                            <span>Claim Inheritance Share</span>
                          </button>
                        }
                    </div>
                    { isCreator &&
                      <div>
                        <table className="table is-hoverable is-fullwidth">
                          <thead>
                            <tr>
                              <th>Validators</th>
                              <th>Death Confirmed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              Object.entries(validators).map((row, idx) => {
                                return (
                                  <tr key={"val_" + idx}>
                                    <td >{row[0]}</td>
                                    <td>{row[1] ? "true" : "false"}</td>
                                  </tr>
                                )
                              })
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
                              Object.entries(beneficiaries).map((row, idx) => {
                                return (
                                  <tr key={"ben_" + idx}>
                                    <td>{row[0]}</td>
                                    <td>{row[1]}</td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </table>
                      </div>
                    }
                </div>
            </div>
          </div>
        )
      }
    </section>
  );
}

export default App;
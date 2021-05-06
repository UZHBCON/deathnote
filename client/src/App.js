import React, {useEffect, useState} from "react";
import DeathNoteContract from "./contracts/DeathNote.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import "./App.sass";
import logo from './images/logo.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faBookDead, faMoneyBillWave, faUsers} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import Table from "./components/Table"

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState('');
    const [validators, setValidatorsState] = useState(null);
    const [beneficiaries, setBeneficiariesState] = useState(null);
    const [creator, setCreator] = useState('');

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
          setCreator(await instance.methods.creator.call().call());
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

    const confirmDeath = async () => {
        setIsLoading(true);
        await contract.methods.confirmDeath().send({from: accounts[0]});
        setIsLoading(false);
    };

    const claimInheritanceShare = async () => {
        setIsLoading(true);
        await contract.methods.claimInheritanceShare().send({from: accounts[0]});
        setIsLoading(false);
    };

    const showParticipants = async () => {
      setValidatorsState(await contract.methods.trackValidators.call().call());
      setBeneficiariesState(await contract.methods.trackBeneficiaries.call().call());
      console.log(validators)
      console.log(beneficiaries)

    }

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

                <div className="controls mb-4">
                  <a className="button is-white mr-2" onClick={confirmDeath}>
                      <span className="icon">
                          <FontAwesomeIcon icon={faBookDead} />
                      </span>
                      <span>Confirm Death</span>
                  </a>
                  <a className="button is-white mr-2" onClick={claimInheritanceShare}>
                      <span className="icon">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                      </span>
                      <span>Claim Inheritance Share</span>
                  </a>
                  <a className="button is-white mr-2" onClick={showParticipants}>
                      <span className="icon">
                          <FontAwesomeIcon icon={faUsers} />
                      </span>
                      <span>Show participants</span>
                  </a> 
                </div>
                <Table />
            </div>
        </div>
    </section>

          









        
  
  );
}

export default App;

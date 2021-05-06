import React, {useEffect, useState} from "react";
import DeathNoteContract from "./contracts/DeathNote.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import "./App.sass";
import Main from "./components/Main.js";

function App() {
    const [storageValue, setStorageValue] = useState(0);
    const [contractValue, setContractValue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [contract, setContract] = useState(null);

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

    if (isLoading) {
        return <h1>Please wait while processing transaction...</h1>
    }

    if (!web3) {
        return <h1>Loading Web3, accounts, and contract...</h1>;
    }
    return (
            <div className="App">
            <Main></Main> 
            <h2 style={{color: "orange"}}>Check console for output</h2>
            <p>Switch Account to: Validator</p>
            <p>Reload page!</p>
            <button onClick={confirmDeath}>Confirm Death</button>
            <p>Switch Account to: Beneficiary</p>
            <p>Reload page!</p>
            <button onClick={claimInheritanceShare}>Claim Inheritance Share</button>            <div>The stored value (+100) is: {contractValue}</div>
        </div>
    );
}

export default App;

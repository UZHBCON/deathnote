import React, {useEffect, useState} from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
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
          const deployedNetwork = SimpleStorageContract.networks[networkId];

          const instance = new web3.eth.Contract(
              SimpleStorageContract.abi,
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

    const runExample = async () => {

        // Stores a given value, 5 by default.
        setIsLoading(true);
        await contract.methods.set(storageValue).send({from: accounts[0]});

        // Get the value from the contract to prove it worked.
        const response = await contract.methods.get().call();
        console.log(response);

        // Update state with the result.
        setContractValue(response);
        setIsLoading(false);
    };

    if (isLoading) {
        return <h1>Please wait while processing transaction...</h1>
    }

    if (!web3) {
        return <h1>Loading Web3, accounts, and contract...</h1>;
    }
    return (
       <Main></Main> 
    );
}

export default App;

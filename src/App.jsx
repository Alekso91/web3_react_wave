import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import ReactDOM from 'react-dom';

const App = () => {

  
  const [currentAccount, setCurrentAccount] = useState("");

  const [allWaves, setAllWaves] = useState([]);
  const [counter, setCounter] = useState(0);


  const contractAddress = "0x655E172a4fB5AC470635cB20BAE2578269EC3B12";
  const contractAbi = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);
        const waves = await wavePortalContract.getAllWavec();
        setCounter(waves.toNumber());
        console.log("Retrieved total wave count is : ", waves.toNumber());

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.tomestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

        getAllWaves();



      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

    } catch (error) {
      console.log(error)
    }
  }


  const wave = async (name) => {
    try {
      console.log(name);
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract( contractAddress, contractAbi, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count is : ", count.toNumber());

        const waveTxn = await wavePortalContract.wave(name, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();

        console.log("Retrieved total wave count is : ", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch(error) {
      console.log(error)
    }
  }




  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  function MyForm() {
    const [name, setName] = useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
    }

    return (
      <form onSubmit={handleSubmit}>
        <label>Enter your message:
          <input
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button className="waveButton" onClick={() => wave(name)}>
          Wave at Alexo
        </button>
      </form>
    )
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Lottery 👋
        </div>
        <p>Come try your luck. There is a 50% chance to win but you will have to wait 2min</p>
        <div className="bio">
        I am Alexo and I'm working on my first web3 project ! Connect your Ethereum wallet and wave at me!
        </div>
        <p>Retrieved total wave count is : {counter}</p>

        <MyForm />



        
        
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}



        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "lightgray", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App
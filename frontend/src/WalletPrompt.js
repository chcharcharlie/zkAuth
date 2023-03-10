import React, { useState } from 'react';
import { BACKEND_URL } from './constants';
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
import generateZKProof from './utils.js';
import CircularStatic from './CircularStatic'

function WalletPrompt({ setShowSignInEmailPrompt }) {
  const [messageState, setMessageState] = useState("");

  const providerOptions = {}

  const web3Modal = new Web3Modal({
    network: "mumbai",
    cacheProvider: false,
    providerOptions
  })

  const connectWallet = async (event) => {
    console.log(`connect wallet`);

    if (web3Modal.cachedProvider) {
      // Clear the user provider so user can select a new one
      web3Modal.clearCachedProvider()
    }
    const wallet = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(wallet)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    console.log(address)
    const nonce = await getNonce(address)
    const proofInputs = await getProofInputs(address, nonce, signer)
    const res = await generateZKProof(address, proofInputs["verificationCode"], proofInputs["timeStamp"], proofInputs["walletAddressHash"], proofInputs["statementIdx"])
    if (window.opener) {
      console.log("pushing message back")
      window.opener.postMessage(res, document.referrer)
      window.close()
    }
  };

  const getNonce = async (walletAddress) => {
    const response = await fetch(`http://${BACKEND_URL}/api/get_wallet_nonce`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "wallet_address": walletAddress }),
    });

    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData
  };

  const getProofInputs = async (walletAddress, nonce, signer) => {
    const signature = await signer.signMessage(`Signin zkAuth using ${walletAddress}, nonce: ${nonce}`)
    const response = await fetch(`http://${BACKEND_URL}/api/get_wallet_proof_inputs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "wallet_address": walletAddress,
        "signature": signature
      }),
    });
    setMessageState("LOADING");

    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData
  }

  if (messageState === "WALLET_POP_UP") {
    return <div className="wallet-pop-up-text">Please sign in using your browser based wallet...</div>
  } else if (messageState === "LOADING") {
    return (
      <div>
        <CircularStatic />
        <div className="wallet-pop-up-text">Generating ZK Proof to protect the privacy of your wallet address...</div>
      </div>
    );
  } else {
    return (
      <div className="signin-button" onClick={() => { connectWallet(); setShowSignInEmailPrompt(false); setMessageState("WALLET_POP_UP") }}>Sign In with Wallet</div>
    );
  }
}

export default WalletPrompt;
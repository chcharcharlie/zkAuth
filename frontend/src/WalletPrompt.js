import React from 'react';
import { BACKEND_URL } from './constants';
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
import generateZKProof from './utils.js';

function WalletPrompt() {
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
      window.opener.postMessage(res, "http://localhost:3002")
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
    const signature = await signer.signMessage(`Signin ZKAuth using ${walletAddress}, nonce: ${nonce}`)
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

    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData
  }

  return (
    <div className="signin-button" onClick={() => { connectWallet() }}>Sign In with Wallet</div>
  );
}

export default WalletPrompt;
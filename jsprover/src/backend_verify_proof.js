const snarkjs = require("snarkjs")
const fs = require('fs')

const { contractABI } = require("./constants.js")
const { ethers } = require('ethers');

const infuraProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const contractAddress = "0x2747552FfF51F53e3Dc57d889318789CA158D0C1"

const proofData = fs.readFileSync('../data/user_proof.json')
const proof = JSON.parse(proofData)

// const merkleData = fs.readFileSync('../data/merkle.json')
// const merkle = JSON.parse(merkleData)

const publicResultsData = fs.readFileSync('../data/public_results.json')
const publicResults = JSON.parse(publicResultsData)

const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);
contract.getState().then((merkle_state) => {
  const publicSignals = [
    merkle_state[1].toBigInt(),
    publicResults.userId,
    publicResults.nullifier,
    publicResults.appPublicId,
  ]

  const vKey = JSON.parse(fs.readFileSync("../../circuits/src/verification_key.json"))

  snarkjs.plonk.verify(vKey, publicSignals, proof).then((res) => {
    if (res === true) {
      console.log("Verification OK")
    } else {
      console.log("Invalid proof")
    }
  })
})
import { BACKEND_URL } from './constants';
const { poseidon } = require('circomlib')
const snarkjs = require("snarkjs")
const { contractABI } = require("./constants.js")
const { ethers } = require('ethers');

const infuraProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const contractAddress = "0x2747552FfF51F53e3Dc57d889318789CA158D0C1"

function calculateMerklePath(elements, position, levels) {
  var current_stack = []
  var path = []
  var pathIndices = []
  for (var i = 0; i < elements.length; i++) {
    current_stack.push(elements[i].toBigInt())
  }

  while (levels > 0) {
    var new_stack = []
    for (i = 0; i * 2 < current_stack.length; i++) {
      const val1 = current_stack[i * 2];
      const val2 = i * 2 + 1 < current_stack.length ? current_stack[i * 2 + 1] : 0
      if (val2 === 0 || val1 < val2) {
        new_stack.push(poseidon([val1, val2]))
      } else {
        new_stack.push(poseidon([val2, val1]))
      }
      if (i * 2 === position || i * 2 + 1 === position) {
        var selfVal, otherVal
        if (i * 2 === position) {
          selfVal = val1
          otherVal = val2
        } else {
          selfVal = val2
          otherVal = val1
        }
        path.push(otherVal)
        pathIndices.push(otherVal === 0 || selfVal < otherVal ? 0 : 1)
      }
    }
    position = Math.floor(position / 2)
    current_stack = new_stack
    levels--
  }
  return { path, pathIndices }
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateZKProof = async (email, verificationCode, timestamp, emailHash, statementIdx) => {
  const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);

  var merkle_state = await contract.getState()
  while (merkle_state[0].length <= statementIdx) {
    console.log("still waiting for contract to settle")
    await sleep(1000);
    merkle_state = await contract.getState()
  }

  const { path, pathIndices } = calculateMerklePath(merkle_state[0], statementIdx, 8)
  console.log("Start to do snarkjs fullProve")
  const appPublicId = 100

  const res = await snarkjs.plonk.fullProve(
    {
      emailHash: emailHash,
      verificationCode: verificationCode,
      randomizer: timestamp,
      path: path,
      pathIndices: pathIndices,
      appPublicId: appPublicId,
    },
    "./circuit.wasm",
    "./circuit_final.zkey"
  )

  const userId = res.publicSignals[1]
  const nullifier = res.publicSignals[2]
  const proof = JSON.stringify(res.proof, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value // return everything else unchanged
  )

  console.log("Generated proof for userId, appPublicId and nullifier:")
  console.log(res.publicSignals[1], res.publicSignals[3], res.publicSignals[2])
  console.log("Proof will be verified if merkle root is equal to:")
  console.log(res.publicSignals[0])

  const data = {
    "publicResults": {
      "userId": userId,
      "nullifier": nullifier,
      "appPublicId": appPublicId,
    },
    "proof": proof,
  }
  return data
}

export default generateZKProof;
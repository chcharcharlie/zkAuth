const { poseidon } = require('circomlib')
const fs = require('fs')
const { contractABI } = require("./constants.js")
const { ethers } = require('ethers');

const infuraProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const contractAddress = "0x2747552FfF51F53e3Dc57d889318789CA158D0C1"
const PRIVATE_KEY = 'cfe7143f593f1fc94c541abce95b53597973ce5d8c9a846faa04bed4570e8174'
const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);
const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);

function calculateMerkleRoot(elements, levels) {
  var current_stack = []
  for (var i = 0; i < elements.length; i++) {
    if (typeof elements[i] === 'BigNumber') {
      current_stack.push(elements[i].toBigInt())
    } else {
      current_stack.push(BigInt(elements[i]))
    }
  }

  while (levels > 0) {
    var new_stack = []
    for (var i = 0; i * 2 < current_stack.length; i++) {
      const val1 = current_stack[i * 2];
      const val2 = i * 2 + 1 < current_stack.length ? current_stack[i * 2 + 1] : 0
      if (val2 === 0 || val1 < val2) {
        new_stack.push(poseidon([val1, val2]))
      } else {
        new_stack.push(poseidon([val2, val1]))
      }
    }
    current_stack = new_stack
    levels--
  }
  return current_stack[0]
}

function generateStatement(emailHash, verificationCode, randomizer) {
  return poseidon([emailHash, verificationCode, randomizer])
}

const attestationData = fs.readFileSync('../data/backend_attestation_inputs.json')
const attestation = JSON.parse(attestationData)
const emailHash = attestation.emailHash
const verificationCode = attestation.verificationCode
const randomizer = attestation.randomizer
const element = generateStatement(emailHash, verificationCode, randomizer)

// const merkleData = fs.readFileSync('../data/merkle.json')
// var merkle = JSON.parse(merkleData)

// merkle.elements.push(element)
contract.getState().then((merkle_state) => {
  // merkle.root = calculateMerkleRoot(merkle.elements, 8)
  const new_root = calculateMerkleRoot([].concat(merkle_state[0], element), 8)

  // fs.writeFileSync(
  //   '../data/merkle.json',
  //   JSON.stringify(merkle, (key, value) =>
  //     typeof value === 'bigint'
  //       ? value.toString()
  //       : value // return everything else unchanged
  //   ),
  // )

  // Call smartcontract to get progress and other info
  contract.connect(signer).addRecord(
    element, new_root,
  )

  console.log({
    "emailHash": emailHash,
    "verificationCode": verificationCode,
    "randomizer": randomizer,
    // "statementIdx": merkle.elements.length - 1,
    "statementIdx": merkle_state[0].length,
  })
})

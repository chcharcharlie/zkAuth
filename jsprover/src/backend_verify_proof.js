const snarkjs = require("snarkjs")
const fs = require('fs')

const proofData = fs.readFileSync('../data/user_proof.json')
const proof = JSON.parse(proofData)

const merkleData = fs.readFileSync('../data/merkle.json')
const merkle = JSON.parse(merkleData)

const publicResultsData = fs.readFileSync('../data/public_results.json')
const publicResults = JSON.parse(publicResultsData)

const publicSignals = [
  merkle.root,
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
const { poseidon } = require('circomlib')
const snarkjs = require("snarkjs")
const fs = require('fs')

function calculateMerklePath(elements, position, levels) {
  var current_stack = elements
  var path = []
  var pathIndices = []

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

const proofInputsData = fs.readFileSync('../data/user_proof_inputs.json')
const proofInputs = JSON.parse(proofInputsData)
const emailHash = proofInputs.emailHash
const verificationCode = proofInputs.verificationCode
const randomizer = proofInputs.randomizer
const statementIdx = proofInputs.statementIdx
const appPublicId = proofInputs.appPublicId

const merkleData = fs.readFileSync('../data/merkle.json')
var merkle = JSON.parse(merkleData)
const { path, pathIndices } = calculateMerklePath(merkle.elements, statementIdx, 8)

snarkjs.plonk.fullProve(
  {
    emailHash: emailHash,
    verificationCode: verificationCode,
    randomizer: randomizer,
    path: path,
    pathIndices: pathIndices,
    appPublicId: appPublicId,
  },
  "../../circuits/src/circuit_js/circuit.wasm",
  "../../circuits/src/circuit_final_16.zkey"
).then(
  (res) => {
    fs.writeFileSync(
      '../data/user_proof.json',
      JSON.stringify(res.proof, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
      ),
    )

    fs.writeFileSync(
      '../data/public_results.json',
      JSON.stringify(
        {
          "merkleRoot": res.publicSignals[0],
          "userId": res.publicSignals[1],
          "nullifier": res.publicSignals[2],
          "appPublicId": res.publicSignals[3],
        },
        (key, value) =>
          typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
      ),
    )

    console.log("Generated proof for userId, appPublicId and nullifier:")
    console.log(res.publicSignals[1], res.publicSignals[3], res.publicSignals[2])
    console.log("Proof will be verified if merkle root is equal to:")
    console.log(res.publicSignals[0])
  }
)
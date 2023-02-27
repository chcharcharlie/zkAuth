const { poseidon } = require('circomlib')
const fs = require('fs')

function calculateMerkleRoot(elements, levels) {
  var current_stack = elements

  for (var i = 0; i < current_stack.length; i++) {
    current_stack[i] = BigInt(current_stack[i])
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

const merkleData = fs.readFileSync('../data/merkle.json')
var merkle = JSON.parse(merkleData)

merkle.elements.push(element)
merkle.root = calculateMerkleRoot(merkle.elements, 8)
fs.writeFileSync(
  '../data/merkle.json',
  JSON.stringify(merkle, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value // return everything else unchanged
  ),
)

console.log({
  "emailHash": emailHash,
  "verificationCode": verificationCode,
  "randomizer": randomizer,
  "statementIdx": merkle.elements.length - 1,
})
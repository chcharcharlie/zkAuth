/* eslint-disable max-len */
const {poseidon} = require('circomlib');

/**
 * generate verification code and send email
 * @param {elements} elements
 * @param {levels} levels
 * @return {root} merkle root
 */
function calculateMerkleRoot(elements, levels) {
  let currentStack = [];
  for (let i = 0; i < elements.length; i++) {
    if (typeof elements[i] === 'BigNumber') {
      currentStack.push(elements[i].toBigInt());
    } else {
      currentStack.push(BigInt(elements[i]));
    }
  }

  while (levels > 0) {
    const newStack = [];
    for (let i = 0; i * 2 < currentStack.length; i++) {
      const val1 = currentStack[i * 2];
      const val2 = i * 2 + 1 < currentStack.length ? currentStack[i * 2 + 1] : 0;
      if (val2 === 0 || val1 < val2) {
        newStack.push(poseidon([val1, val2]));
      } else {
        newStack.push(poseidon([val2, val1]));
      }
    }
    currentStack = newStack;
    levels--;
  }
  return currentStack[0];
}

module.exports = {calculateMerkleRoot};

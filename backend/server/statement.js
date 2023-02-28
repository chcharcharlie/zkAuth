const {poseidon} = require('circomlib');
const crypto = require('crypto');


/**
 * generate zk statement
 * @param {email} email
 * @param {verificationCode} verificationCode
 * @param {randomizer} randomizer
 * @return {statement} zk statement
 */
function generateStatement(email, verificationCode, randomizer) {
  const md5 = crypto.createHash('md5').update(email).digest('hex');
  const bigInt = BigInt(`0x${md5.substring(0, 16)}`);
  return [poseidon([bigInt, verificationCode, randomizer]), bigInt];
}

module.exports = {generateStatement};

const randomize = require('randomatic');
const { generateStatement } = require('./statement');
const { sendVerificationCode } = require('./email');
const { contractABI } = require('./constants.js');
const { ethers } = require('ethers');
const { calculateMerkleRoot } = require('./merkle');


/**
 * generate verification code and send email
 * @param {req} req
 * @param {res} res
 */
async function generateVerificationCode(req, res) {
  // send verification code
  const email = req.body.email;
  const verificationCode = randomize('0', 6);
  sendVerificationCode(email, verificationCode);

  // generate zk statement
  const element = generateStatement(email, verificationCode, Date.now());
  console.log(element);

  // update merkle tree
  const infuraProvider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d');
  const contractAddress = '0x2747552FfF51F53e3Dc57d889318789CA158D0C1';
  const PRIVATE_KEY = 'cfe7143f593f1fc94c541abce95b53597973ce5d8c9a846faa04bed4570e8174';
  const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);
  const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);
  contract.getState().then((merkleState) => {
    const newRoot = calculateMerkleRoot([].concat(merkleState[0], element), 8);
    // Call smartcontract to get progress and other info
    contract.connect(signer).addRecord(
      element, newRoot,
    );
  });

  return;
}

module.exports = { generateVerificationCode };
const randomize = require('randomatic');
const snarkjs = require('snarkjs');
const { ethers } = require('ethers');

const { generateStatement } = require('./statement');
const { sendVerificationCode } = require('./email');
const { calculateMerkleRoot } = require('./merkle');
const { contractABI, verificationKey } = require('./constants.js');

const infuraProvider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d');
const contractAddress = '0x2747552FfF51F53e3Dc57d889318789CA158D0C1';
const PRIVATE_KEY = 'cfe7143f593f1fc94c541abce95b53597973ce5d8c9a846faa04bed4570e8174';


/**
 * generate verification code and send email
 * @param {req} req
 * @param {res} res
 */
async function generateVerificationCode(req, res) {
  // send verification code
  const email = req.body.email;
  const verificationCode = randomize('0', 6);
  await sendVerificationCode(email, verificationCode);

  // generate zk statement
  const timeStamp = Date.now();
  const [element, emailHash] = generateStatement(email, verificationCode, timeStamp);

  // update merkle tree
  const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);
  const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);
  let statementIdx = 0;
  await contract.getState().then((merkleState) => {
    const newRoot = calculateMerkleRoot([].concat(merkleState[0], element), 8);
    // Call smartcontract to get progress and other info
    contract.connect(signer).addRecord(
      element, newRoot,
    );
    statementIdx = merkleState[0].length;
  });

  return {
    'timeStamp': timeStamp,
    'statementIdx': statementIdx,
    'emailHash': emailHash.toString(),
  };
}

/**
 * validate zk proof
 * @param {req} req
 * @param {res} res
 */
async function validateProof(req, res) {
  // read request body
  const publicResults = req.body.publicResults;
  const proof = JSON.parse(req.body.proof);

  // verify proof
  const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);
  let isVerified = false;
  const merkleState = await contract.getState();
  const publicSignals = [
    merkleState[1].toBigInt(),
    publicResults.userId,
    publicResults.nullifier,
    publicResults.appPublicId,
  ];

  const verifyResult = await snarkjs.plonk.verify(verificationKey, publicSignals, proof);
  if (verifyResult === true) {
    console.log('Verification OK');
    isVerified = true;
  } else {
    console.log('Invalid proof');
  }
  return { 'isVerified': isVerified };
}

module.exports = { generateVerificationCode, validateProof };
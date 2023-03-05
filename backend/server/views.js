/* eslint-disable max-len */
const randomize = require('randomatic');
const { contractABI, verificationKey } = require('./constants.js');
const { ethers } = require('ethers');
const snarkjs = require('snarkjs');
const uuid = require('uuid4');
const Web3 = require('web3');
const web3 = new Web3();
const { getData, setData } = require('./firebase');
const { generateStatement } = require('./statement');
const { sendVerificationCode } = require('./email');
const { calculateMerkleRoot } = require('./merkle');

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


/**
 * Add two numbers.
 * @param {number} req request
 * @param {number} res response
 * @return {number} Get signature nonce
 */
async function getWalletNonce(req, res) {
  const walletAddress = req.body.wallet_address;
  if (!walletAddress) {
    res.status(400).send('Not valid');
    return;
  }

  const nonceInfo = await getData('wallets/' +
    walletAddress + '/nonces/');

  if (nonceInfo && nonceInfo.expires_at > Date.now()) {
    return nonceInfo.nonce;
  } else {
    const newNonce = uuid();
    const expiresAt = Date.now() + 600000; // nonce expires in 10 minutes
    await setData('wallets/' + walletAddress + '/nonces/', {
      'nonce': newNonce,
      'expires_at': expiresAt,
    });
    return newNonce;
  }
}

/**
 * Add two numbers.
 * @param {number} req request
 * @param {number} res response
 * @return {number} Get signature nonce
 */
async function getWalletProofInputs(req, res) {
  const walletAddress = req.body.wallet_address;
  const signature = req.body.signature;
  if (!walletAddress || !signature) {
    res.status(400).send('Not valid');
    return;
  }

  const nonceInfo = await getData('wallets/' +
    walletAddress + '/nonces');
  if (!nonceInfo || nonceInfo.expires_at < Date.now()) {
    res.status(401).send('Not authorized');
    return;
  }

  // Verify the signature is with information we expected
  const expectedAddress = web3.eth.accounts.recover('Signin zkAuth using ' +
    walletAddress + ', nonce: ' +
    nonceInfo.nonce, signature);
  if (!expectedAddress || expectedAddress != walletAddress) {
    res.status(401).send('Not authorized');
    return;
  }

  // generate zk statement
  const verificationCode = randomize('0', 6);

  const timeStamp = Date.now();
  const [element, walletAddressHash] = generateStatement(walletAddress, verificationCode, timeStamp);

  // update merkle tree
  const PRIVATE_KEY = 'cfe7143f593f1fc94c541abce95b53597973ce5d8c9a846faa04bed4570e8174';
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
    'walletAddressHash': walletAddressHash.toString(),
    'verificationCode': verificationCode,
  };
}

module.exports = { generateVerificationCode, validateProof, getWalletNonce, getWalletProofInputs };

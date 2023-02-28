const randomize = require('randomatic');
const { generateStatement } = require('./statement');
const { sendVerificationCode } = require('./email');


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

  return;
}

module.exports = { generateVerificationCode };
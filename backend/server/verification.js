const randomize = require('randomatic');

const user = 'zkauth@gmail.com';
const pass = '';

/**
 * generate verification code and send email
 * @param {req} req
 * @param {res} res
 */
async function generateVerificationCode(req, res) {
  const verificationCode = randomize('0', 6);
  const email = req.body.email;

  const send = require('gmail-send')({
    user: user,
    pass: pass,
    to: email,
    subject: 'Your ZKAuth Verification Code',
  });
  send({
    text: verificationCode,
  }, (error, result, fullResult) => {
    if (error) console.error(error);
    console.log(result);
  });

  return;
}

module.exports = { generateVerificationCode };
const user = 'zkauth@gmail.com';
const pass = '';

/**
 * send verification code email
 * @param {email} email
 * @param {verificationCode} verificationCode
 */
async function sendVerificationCode(email, verificationCode) {
  const send = require('gmail-send')({
    user: user,
    pass: pass,
    to: email,
    subject: 'Your ZKAuth Verification Code',
  });
  await send({
    text: verificationCode,
  }, (error, result, fullResult) => {
    if (error) console.error(error);
    console.log(result);
  });

  return;
}

module.exports = { sendVerificationCode };

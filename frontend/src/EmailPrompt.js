import React from 'react';
import { Input, Button, FormLabel } from '@mui/material';
import { BACKEND_URL } from './constants';

function EmailPrompt({ setShowCodePrompt, email, setEmail, setTimestamp, setEmailHash, setStatementIdx }) {

  const handleInputChange = (event) => {
    setEmail(event.target.value);
  };

  const generateVerificationCode = async (data) => {
    const response = await fetch(`http://${BACKEND_URL}/api/generate_verification_code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const jsonData = await response.json();
    console.log(jsonData);
    setTimestamp(jsonData["timeStamp"])
    setEmailHash(jsonData["emailHash"])
    setStatementIdx(jsonData["statementIdx"])
    // show code prompt
    setShowCodePrompt(true)
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`User entered email: ${email}`);
    generateVerificationCode({ "email": email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormLabel htmlFor="email-input">Email:</FormLabel>
      <br />
      <Input
        type="email"
        id="email-input"
        value={email}
        onChange={handleInputChange}
        placeholder="Enter your email"
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default EmailPrompt;
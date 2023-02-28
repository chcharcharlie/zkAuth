import React, { useState } from 'react';
import { Input, Button, FormLabel } from '@mui/material';
import generateZKProof from './utils.js';

function CodePrompt({ email, timestamp, emailHash, statementIdx, setIsVerified }) {
  const [code, setCode] = useState('');

  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await generateZKProof(email, code, timestamp, emailHash, statementIdx, setIsVerified)
    console.log(`User entered code: ${code}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormLabel htmlFor="code-input">Code:</FormLabel>
      <br />
      <Input
        id="code-input"
        value={code}
        onChange={handleInputChange}
        placeholder="Enter your code"
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default CodePrompt;
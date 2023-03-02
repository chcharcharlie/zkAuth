import React, { useState } from 'react';
import { Input, Button } from '@mui/material';
import generateZKProof from './utils.js';

function CodePrompt({ email, timestamp, emailHash, statementIdx }) {
  const [code, setCode] = useState('');

  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const res = await generateZKProof(email, code, timestamp, emailHash, statementIdx)
    console.log(`User entered code: ${code}`);
    if (window.opener) {
      console.log("pushing message back")
      window.opener.postMessage(res, "http://localhost:3002")
      window.close()
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        className="input"
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
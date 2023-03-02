import React, { useState } from 'react';
import { Input, Button } from '@mui/material';
import generateZKProof from './utils.js';
import CircularStatic from './CircularStatic'

function CodePrompt({ email, timestamp, emailHash, statementIdx }) {
  const [code, setCode] = useState('');
  const [messageState, setMessageState] = useState("");

  const handleInputChange = (event) => {
    setCode(event.target.value);
  };

  const handleSubmit = async (event) => {
    setMessageState("LOADING")
    event.preventDefault();
    const res = await generateZKProof(email, code, timestamp, emailHash, statementIdx)
    console.log(`User entered code: ${code}`);
    if (window.opener) {
      console.log("pushing message back")
      window.opener.postMessage(res, "http://localhost:3002")
      window.close()
    }
  };

  if (messageState === "LOADING") {
    return (
      <div>
        <CircularStatic />
        <div className="wallet-pop-up-text">Generating ZK Proof to protect the privacy of your email...</div>
      </div>
    );
  } else {
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
}

export default CodePrompt;
import React, { useState } from 'react';
import './App.css';
import WindowOpener from './WindowOpener'

function App() {
  const [showCodePrompt, setShowCodePrompt] = useState(false);
  const [email, setEmail] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [emailHash, setEmailHash] = useState('');
  const [statementIdx, setStatementIdx] = useState('');
  const [isVerified, setIsVerified] = useState(false);


  return (
    <div className="App">
      <WindowOpener url='http://localhost:3000/'>Sign in with ZKAuth</WindowOpener>
      <div>{isVerified}</div>
    </div >
  );
}

export default App;
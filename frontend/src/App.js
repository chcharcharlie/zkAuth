import React, { useState } from 'react';
import './App.css';
import CodePrompt from './CodePrompt';
import EmailPrompt from './EmailPrompt';
import WalletPrompt from './WalletPrompt';

function App() {
  const [showCodePrompt, setShowCodePrompt] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [email, setEmail] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [emailHash, setEmailHash] = useState('');
  const [statementIdx, setStatementIdx] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="App">
      <div className="title">
        ZKAuth
      </div>
      <WalletPrompt
        setIsVerified={setIsVerified}>
      </WalletPrompt>
      {
        !showCodePrompt && showEmailPrompt ?
          <EmailPrompt
            setShowCodePrompt={setShowCodePrompt}
            email={email}
            setEmail={setEmail}
            setTimestamp={setTimestamp}
            setEmailHash={setEmailHash}
            setStatementIdx={setStatementIdx}
            setShowEmailPrompt={setShowEmailPrompt}>
          </EmailPrompt> : <div onClick={() => setShowEmailPrompt(true)} className="signin-button">Sign in with Email</div>
      }
      {showCodePrompt ? <CodePrompt email={email} timestamp={timestamp} emailHash={emailHash} statementIdx={statementIdx} setIsVerified={setIsVerified}></CodePrompt> : <div />}
      <div>{isVerified}</div>
    </div >
  );
}

export default App;
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

  return (
    <div className="App">
      <div className="title">
        ZKAuth
      </div>
      <WalletPrompt />
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
          </EmailPrompt> : <div />
      }
      {!showEmailPrompt && !showCodePrompt ? <div onClick={() => setShowEmailPrompt(true)} className="signin-button">Sign in with Email</div> : <div />}
      {showCodePrompt ? <CodePrompt email={email} timestamp={timestamp} emailHash={emailHash} statementIdx={statementIdx}></CodePrompt> : <div />}
      <div className='footer'>Build with ❤️ in ETHDenver 2023</div>
    </div >
  );
}

export default App;
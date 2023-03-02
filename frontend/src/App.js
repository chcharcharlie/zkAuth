import React, { useState } from 'react';
import './App.css';
import CodePrompt from './CodePrompt';
import EmailPrompt from './EmailPrompt';
import WalletPrompt from './WalletPrompt';

function App() {
  const [showSignInWalletPrompt, setShowSignInWalletPrompt] = useState(true);
  const [showSignInEmailPrompt, setShowSignInEmailPrompt] = useState(true);
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
      {showSignInWalletPrompt ? <WalletPrompt setIsVerified={setIsVerified} setShowSignInEmailPrompt={setShowSignInEmailPrompt} /> : <div />}
      {showSignInEmailPrompt ?
        <div onClick={() => { setShowEmailPrompt(true); setShowSignInWalletPrompt(false); setShowSignInEmailPrompt(false) }} className="signin-button">Sign In with Email</div> : <div />}
      {
        showEmailPrompt ?
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
      {showCodePrompt ? <CodePrompt email={email} timestamp={timestamp} emailHash={emailHash} statementIdx={statementIdx} setIsVerified={setIsVerified}></CodePrompt> : <div />}
      <div>{isVerified}</div>
      <div className='footer'>Build with ❤️ in ETHDenver 2023</div>
    </div >
  );
}

export default App;
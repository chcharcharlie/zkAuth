import React, { useState } from 'react';
import './App.css';
import ZKAuth from 'zkauth/dist/ZKAuth'

function App() {
  const [userId, setUserId] = useState(false);

  const onSignin = async (userId) => {
    console.log(userId)
    setUserId(userId)
  }

  const onSigninFail = async () => {
    console.log("Sign in failed")
    setUserId("Sign in failed")
  }

  function truncateUserId(userId) {
    const len = userId.length
    return userId.substring(0, 5) + "... ..." + userId.substring(len - 5, len)
  }

  return (
    <div className="App">
      <div className="MainImage">
        <img className="Image" src="./ethdenver.png" alt="EthDenver"></img>
      </div>
      <div className="ZKAuth">
        <ZKAuth
          zkAuthUrl='http://localhost:3000/?appPublicId=100'
          zkAuthBackendUrl="http://localhost:3001"
          ownAppOrigin="http://localhost:3000"
          className="ZKAuthButton"
          onSignInSuccess={onSignin}
          onSignInFail={onSigninFail}
        >
          SIGN IN WITH ZKAUTH
        </ZKAuth>
        {userId && <div className="ZKAuthUserId">Signed In as UserID: {truncateUserId(userId)}</div>}
      </div>
    </div >
  );
}

export default App;
import './App.css';
import ZKAuth from './ZKAuth'

function App() {
  const onSignin = async (userId) => {
    console.log(userId)
  }

  const onSigninFail = async () => {
    console.log("Sign in failed")
  }

  return (
    <div className="App">
      <div className="MainImage">
        <img className="Image" src="./ethdenver.png" alt="EthDenver"></img>
      </div>
      <div className="ZKAuth">
        <ZKAuth
          url='http://localhost:3000/?appPublicId=100'
          className="ZKAuthButton"
          userIdClassName="ZKAuthUserId"
          onSignInSuccess={onSignin}
          onSignInFail={onSigninFail}
        >
          SIGN IN WITH ZKAUTH
        </ZKAuth>
      </div>
    </div >
  );
}

export default App;
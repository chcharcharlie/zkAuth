import './App.css';
import ZKAuth from './ZKAuth'

function App() {
  return (
    <div className="App">
      <div className="MainImage">
        <img className="Image" src="./ethdenver.png" alt="EthDenver"></img>
      </div>
      <div className="ZKAuth">
        <ZKAuth url='http://localhost:3000/' className="ZKAuthButton" userIdClassName="ZKAuthUserId">SIGN IN WITH ZKAUTH</ZKAuth>
      </div>
    </div >
  );
}

export default App;
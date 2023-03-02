import './App.css';
import ZKAuth from './ZKAuth'

function App() {
  return (
    <div className="App">
      <ZKAuth url='http://localhost:3000/'>Sign in with ZKAuth</ZKAuth>
    </div >
  );
}

export default App;
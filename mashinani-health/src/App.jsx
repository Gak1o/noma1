import { useState } from 'react';
import './App.css';
import { VideoRoom } from '/src/Components/VideoRoom.jsx';


function App() {
  const [joined, setJoined] = useState(false);
  return (
    <div className="App">
      <h1>Daktari Mashinani</h1>

      {!joined && (
        <button onClick={() => setJoined(true)}>
          Join Room
        </button>
      )}

      {joined && <VideoRoom />}
    </div>
  );
}

export default App;
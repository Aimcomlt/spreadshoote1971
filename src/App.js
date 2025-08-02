import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

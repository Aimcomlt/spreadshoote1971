import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './MainMenu.css';

function MainMenu() {
  const highScore = useSelector((state) => state.game.highScore);

  return (
    <div className="main-menu">
      <h1>Spreadshooter1971</h1>
      {highScore > 0 && <p>High Score: {highScore}</p>}
      <Link to="/game" className="menu-button">Start Game</Link>
      <Link to="/settings" className="menu-button">Settings</Link>
    </div>
  );
}

export default MainMenu;

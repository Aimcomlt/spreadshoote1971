import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { toggleSound, setDifficulty } from '../store/settingsSlice';
import './Settings.css';

function Settings() {
  const dispatch = useDispatch();
  const soundOn = useSelector((state) => state.settings.soundOn);
  const difficulty = useSelector((state) => state.settings.difficulty);

  return (
    <div className="settings-screen">
      <h2>Settings</h2>
      <div>
        <label>
          <input type="checkbox" checked={soundOn} onChange={() => dispatch(toggleSound())} />{' '}
          Sound {soundOn ? 'On' : 'Off'}
        </label>
      </div>
      <div>
        <label>
          Difficulty:{' '}
          <select value={difficulty} onChange={(e) => dispatch(setDifficulty(e.target.value))}>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>
      <p><Link to="/" className="menu-button">Main Menu</Link></p>
    </div>
  );
}

export default Settings;

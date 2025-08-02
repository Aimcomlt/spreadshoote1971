import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetGame } from '../store/gameSlice';
import { usePointerControls } from '../hooks/usePointerControls';
import './GameScreen.css';

function GameScreen() {
  const dispatch = useDispatch();
  const lives = useSelector((state) => state.game.lives);

  useEffect(() => {
    dispatch(resetGame());
  }, [dispatch]);

  usePointerControls(({ x, y, pointerType }) => {
    console.log(`Pointer down at ${x}, ${y} via ${pointerType}`);
    // Placeholder for shooting or other actions
  });

  return (
    <div className="game-screen" style={{ touchAction: 'none' }}>
      <canvas id="game-canvas" width="800" height="600" />
      <div className="hud">Lives: {lives}</div>
    </div>
  );
}

export default GameScreen;

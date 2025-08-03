import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetGame } from '../store/gameSlice';
import { usePointerControls } from '../hooks/usePointerControls';
import loadSprites from '../utils/spriteLoader';
import { createGameState, updateGameState } from '../utils/gameState';
import './GameScreen.css';

function GameScreen() {
  const dispatch = useDispatch();
  const lives = useSelector((state) => state.game.lives);
  const stateRef = useRef(createGameState());

  useEffect(() => {
    dispatch(resetGame());
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const state = (stateRef.current = createGameState());
    let animationId;

    loadSprites().then((sprites) => {
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateGameState(state);

        ctx.drawImage(
          sprites.player || sprites.enemies,
          state.player.x,
          state.player.y,
          state.player.width,
          state.player.height
        );

        state.enemies.forEach((enemy) => {
          ctx.drawImage(
            sprites.enemies,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          );
        });

        state.bullets.forEach((bullet) => {
          ctx.drawImage(
            sprites.bullets,
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
          );
        });

        animationId = requestAnimationFrame(render);
      };

      render();
    });

    return () => cancelAnimationFrame(animationId);
  }, [dispatch]);

  usePointerControls(({ type, x, y }) => {
    if (type === 'move' || type === 'down') {
      const player = stateRef.current.player;
      player.x = Math.max(
        0,
        Math.min(800 - player.width, x - player.width / 2)
      );
      player.y = Math.max(
        0,
        Math.min(600 - player.height, y - player.height / 2)
      );
    } else if (type === 'up') {
      stateRef.current.bullets.push({
        x:
          stateRef.current.player.x +
          stateRef.current.player.width / 2 -
          4,
        y: stateRef.current.player.y,
        width: 8,
        height: 16,
        vy: 6,
      });
    }
  });

  return (
    <div className="game-screen" style={{ touchAction: 'none' }}>
      <canvas id="game-canvas" width="800" height="600" />
      <div className="hud">Lives: {lives}</div>
    </div>
  );
}

export default GameScreen;

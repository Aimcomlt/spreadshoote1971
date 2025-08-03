import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetGame } from '../store/gameSlice';
import { usePointerControls } from '../hooks/usePointerControls';
import loadSprites from '../utils/spriteLoader';
import loadSounds from '../utils/audioLoader';
import { createGameState, updateGameState } from '../utils/gameState';
import './GameScreen.css';

function GameScreen() {
  const dispatch = useDispatch();
  const lives = useSelector((state) => state.game.lives);
  const soundOn = useSelector((state) => state.settings.soundOn);
  const stateRef = useRef(createGameState());
  const soundsRef = useRef({});
  const explosionCountRef = useRef(0);

  useEffect(() => {
    dispatch(resetGame());
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const state = (stateRef.current = createGameState());
    state.bounds = { width: canvas.width, height: canvas.height };
    let animationId;
    let lastTime = performance.now();

    Promise.all([loadSprites(), loadSounds()]).then(([sprites, sounds]) => {
      soundsRef.current = sounds;
      sounds.background.loop = true;
      if (soundOn) {
        sounds.background.play();
      }

      const render = (time) => {
        const delta = (time - lastTime) / 1000;
        lastTime = time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateGameState(state, dispatch, delta);

        if (soundOn && soundsRef.current.explosion) {
          const newExplosions =
            state.explosions.length - explosionCountRef.current;
          for (let i = 0; i < newExplosions; i++) {
            const boom = soundsRef.current.explosion.cloneNode();
            boom.play();
          }
        }
        explosionCountRef.current = state.explosions.length;

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

        state.explosions.forEach((explosion) => {
          ctx.drawImage(
            sprites.explosion,
            explosion.x,
            explosion.y,
            explosion.width,
            explosion.height
          );
        });

        animationId = requestAnimationFrame(render);
      };

      animationId = requestAnimationFrame(render);
    });

    return () => {
      cancelAnimationFrame(animationId);
      if (soundsRef.current.background) {
        soundsRef.current.background.pause();
        soundsRef.current.background.currentTime = 0;
      }
    };
  }, [dispatch]);

  useEffect(() => {
    const bg = soundsRef.current.background;
    if (!bg) return;
    if (soundOn) {
      bg.play();
    } else {
      bg.pause();
    }
  }, [soundOn]);

  usePointerControls(({ type, x, y }) => {
    if (type === 'move' || type === 'down') {
      const { player, bounds } = stateRef.current;
      player.x = Math.max(
        0,
        Math.min(bounds.width - player.width, x - player.width / 2)
      );
      player.y = Math.max(
        0,
        Math.min(bounds.height - player.height, y - player.height / 2)
      );
    } else if (type === 'up' || type === 'fire') {
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
      if (soundOn && soundsRef.current.shoot) {
        const pew = soundsRef.current.shoot.cloneNode();
        pew.play();
      }
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

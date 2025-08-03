import { useEffect, useRef, useCallback } from 'react';
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
  const starsRef = useRef({ bg: [], fg: [] });

  const initStars = (width, height) => {
    const bg = [];
    const fg = [];
    for (let i = 0; i < 100; i++) {
      bg.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 20 + Math.random() * 20,
      });
    }
    for (let i = 0; i < 50; i++) {
      fg.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 60 + Math.random() * 40,
      });
    }
    starsRef.current = { bg, fg };
  };

  useEffect(() => {
    dispatch(resetGame());
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const state = (stateRef.current = createGameState());

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      state.bounds = { width: canvas.width, height: canvas.height };
      initStars(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

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

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#001');
        gradient.addColorStop(1, '#113');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { bg, fg } = starsRef.current;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        bg.forEach((star) => {
          star.y += star.speed * delta;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
          ctx.fillRect(star.x, star.y, 2, 2);
        });
        ctx.fillStyle = '#fff';
        fg.forEach((star) => {
          star.y += star.speed * delta;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
          ctx.fillRect(star.x, star.y, 3, 3);
        });

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
          const progress = explosion.frame / 15;
          const radius = (explosion.width / 2) * progress;
          const x = explosion.x + explosion.width / 2;
          const y = explosion.y + explosion.height / 2;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, 'rgba(255,255,255,0.9)');
          grad.addColorStop(0.5, 'rgba(255,165,0,0.7)');
          grad.addColorStop(1, 'rgba(255,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        animationId = requestAnimationFrame(render);
      };

      animationId = requestAnimationFrame(render);
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (soundsRef.current.background) {
        soundsRef.current.background.pause();
        soundsRef.current.background.currentTime = 0;
      }
    };
  }, [dispatch, soundOn]);

  useEffect(() => {
    const bg = soundsRef.current.background;
    if (!bg) return;
    if (soundOn) {
      bg.play();
    } else {
      bg.pause();
    }
  }, [soundOn]);

  const handlePointer = useCallback(
    ({ type, x, y }) => {
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
    },
    [soundOn]
  );

  usePointerControls(handlePointer);

  return (
    <div className="game-screen" style={{ touchAction: 'none' }}>
      <canvas id="game-canvas" />
      <div className="hud">Lives: {lives}</div>
    </div>
  );
}

export default GameScreen;

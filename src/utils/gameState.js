import { incrementScore } from '../store/gameSlice';
import { store } from '../store';
import { DIFFICULTY_CONFIG } from '../store/settingsSlice';

function createEnemy(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const x = Math.random() * (800 - 48);
  switch (difficulty) {
    case 'easy':
      return { x, y: 0, width: 48, height: 48, vx: 0, vy: config.enemySpeed };
    case 'hard':
      return {
        x,
        y: 0,
        width: 48,
        height: 48,
        vx: (Math.random() * 2 - 1) * config.enemySpeed,
        vy: config.enemySpeed + 1,
      };
    case 'normal':
    default:
      return {
        x,
        y: 0,
        width: 48,
        height: 48,
        vx: Math.random() < 0.5 ? -config.enemySpeed : config.enemySpeed,
        vy: config.enemySpeed,
      };
  }
}

export function createGameState() {
  const difficulty = store.getState().settings.difficulty;
  return {
    player: { x: 400, y: 550, width: 48, height: 48, vx: 0, vy: 0 },
    enemies: [],
    bullets: [],
    explosions: [],
    spawnTimer: 0,
    spawnInterval: DIFFICULTY_CONFIG[difficulty].spawnInterval,
    level: 1,
    difficulty,
  };
}

export function updateGameState(state, dispatch, delta = 1 / 60) {
  const difficulty = store.getState().settings.difficulty;
  const deltaFrames = delta * 60;

  // If difficulty changed mid-game, update spawn interval accordingly
  if (difficulty !== state.difficulty) {
    state.difficulty = difficulty;
    state.spawnInterval = DIFFICULTY_CONFIG[difficulty].spawnInterval;
    state.spawnTimer = 0;
  }

  // Handle enemy spawning based on a timer
  state.spawnTimer += deltaFrames;
  if (state.spawnTimer >= state.spawnInterval) {
    state.enemies.push(createEnemy(difficulty));
    state.spawnTimer = 0;
  }

  state.enemies.forEach((enemy) => {
    enemy.x += enemy.vx * deltaFrames;
    enemy.y += enemy.vy * deltaFrames;
    if (enemy.x < 0 || enemy.x + enemy.width > 800) {
      enemy.vx *= -1;
    }
  });

  state.bullets.forEach((bullet) => {
    bullet.y -= bullet.vy * deltaFrames;
  });
  state.bullets = state.bullets.filter((bullet) => bullet.y + bullet.height > 0);

  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const enemy = state.enemies[j];
      const overlap =
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y;

      if (overlap) {
        state.bullets.splice(i, 1);
        state.enemies.splice(j, 1);
        state.explosions.push({
          x: enemy.x,
          y: enemy.y,
          width: enemy.width,
          height: enemy.height,
          frame: 0,
        });
        dispatch && dispatch(incrementScore());
        break;
      }
    }
  }

  const score = store.getState().game.score;
  const newLevel = Math.floor(score / 10) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    state.spawnInterval = Math.max(10, state.spawnInterval - 5);
    state.spawnTimer = 0;
  }

  state.explosions.forEach((explosion) => {
    explosion.frame += deltaFrames;
  });
  state.explosions = state.explosions.filter((explosion) => explosion.frame < 15);
}

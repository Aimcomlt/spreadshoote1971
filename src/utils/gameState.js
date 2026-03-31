import { gainLife, incrementScore, playerDamaged } from '../store/gameSlice';
import { store } from '../store';
import { DIFFICULTY_CONFIG } from '../store/settingsSlice';

const POWERUP_TYPES = {
  BOMB: 'bomb',
  LIFE: 'life',
  INVINCIBLE: 'invincible',
};

function createEnemy(difficulty, boundsWidth = 800) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const maxX = Math.max(0, boundsWidth - 48);
  const x = Math.random() * maxX;
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

function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function createRandomPowerup(level, difficulty, x, y) {
  const difficultyMultiplier = difficulty === 'hard' ? 1.3 : difficulty === 'easy' ? 0.8 : 1;
  const weightedRoll = Math.random() * (1 + level * 0.05) * difficultyMultiplier;

  if (weightedRoll < 0.5) return null;
  if (weightedRoll < 1.1) return POWERUP_TYPES.BOMB;
  if (weightedRoll < 1.7) return POWERUP_TYPES.INVINCIBLE;
  return POWERUP_TYPES.LIFE;
}

export function createGameState(bounds = { width: 800, height: 600 }) {
  const difficulty = store.getState().settings.difficulty;
  return {
    player: { x: 400, y: 550, width: 48, height: 48, vx: 0, vy: 0, invincibleUntil: 0 },
    wingman: { x: 450, y: 560, width: 36, height: 36, hp: 100, maxHp: 100, active: true },
    enemies: [],
    bullets: [],
    explosions: [],
    powerups: [],
    spawnTimer: 0,
    spawnInterval: DIFFICULTY_CONFIG[difficulty].spawnInterval,
    level: 1,
    levelDropsMultiplier: 1,
    damageCooldown: 0,
    dropChance: 0.12,
    elapsed: 0,
    difficulty,
    bounds,
  };
}

export function updateGameState(state, dispatch, delta = 1 / 60) {
  const difficulty = store.getState().settings.difficulty;
  const deltaFrames = delta * 60;
  const now = performance.now();
  state.elapsed += delta;

  // If difficulty changed mid-game, update spawn interval accordingly
  if (difficulty !== state.difficulty) {
    state.difficulty = difficulty;
    state.spawnInterval = DIFFICULTY_CONFIG[difficulty].spawnInterval;
    state.spawnTimer = 0;
  }

  // Handle enemy spawning based on a timer
  state.spawnTimer += deltaFrames;
  if (state.spawnTimer >= state.spawnInterval) {
    state.enemies.push(createEnemy(difficulty, state.bounds?.width));
    state.spawnTimer = 0;
  }

  const boundsWidth = state.bounds?.width ?? 800;
  const boundsHeight = state.bounds?.height ?? 600;

  state.damageCooldown = Math.max(0, state.damageCooldown - delta);
  state.wingman.x = Math.min(
    boundsWidth - state.wingman.width,
    state.player.x + state.player.width + 8
  );
  state.wingman.y = Math.min(
    boundsHeight - state.wingman.height,
    state.player.y + Math.max(0, state.player.height - state.wingman.height)
  );
  state.wingman.active = state.wingman.hp > 0;

  state.enemies.forEach((enemy) => {
    enemy.x += enemy.vx * deltaFrames;
    enemy.y += enemy.vy * deltaFrames;
    if (enemy.x < 0 || enemy.x + enemy.width > boundsWidth) {
      enemy.vx *= -1;
      enemy.x = Math.max(0, Math.min(boundsWidth - enemy.width, enemy.x));
    }
  });

  state.bullets.forEach((bullet) => {
    bullet.y -= bullet.vy * deltaFrames;
  });
  state.bullets = state.bullets.filter((bullet) => bullet.y + bullet.height > 0);
  state.powerups.forEach((powerup) => {
    powerup.y += powerup.vy * deltaFrames;
  });
  state.powerups = state.powerups.filter((powerup) => powerup.y < boundsHeight + powerup.height);

  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const enemy = state.enemies[j];
      if (overlaps(bullet, enemy)) {
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
        const dropRoll = Math.random();
        if (dropRoll < state.dropChance * state.levelDropsMultiplier) {
          const powerupType = createRandomPowerup(state.level, difficulty, enemy.x, enemy.y);
          if (powerupType) {
            state.powerups.push({
              type: powerupType,
              x: enemy.x + enemy.width / 2 - 12,
              y: enemy.y,
              width: 24,
              height: 24,
              vy: 1.5,
            });
          }
        }
        break;
      }
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    const hitPlayer = overlaps(enemy, state.player);
    const hitWingman = state.wingman.active && overlaps(enemy, state.wingman);

    if (hitWingman) {
      state.wingman.hp = Math.max(0, state.wingman.hp - 20);
      state.enemies.splice(i, 1);
      state.explosions.push({
        x: enemy.x,
        y: enemy.y,
        width: enemy.width,
        height: enemy.height,
        frame: 0,
      });
      continue;
    }

    if (hitPlayer) {
      state.enemies.splice(i, 1);
      state.explosions.push({
        x: enemy.x,
        y: enemy.y,
        width: enemy.width,
        height: enemy.height,
        frame: 0,
      });
      const isInvincible = now < state.player.invincibleUntil;
      if (!isInvincible && state.damageCooldown <= 0) {
        dispatch && dispatch(playerDamaged());
        state.damageCooldown = 0.8;
      }
    }
  }

  for (let i = state.powerups.length - 1; i >= 0; i--) {
    const powerup = state.powerups[i];
    if (!overlaps(powerup, state.player)) continue;
    state.powerups.splice(i, 1);
    if (powerup.type === POWERUP_TYPES.BOMB) {
      const destroyed = state.enemies.length;
      state.enemies = [];
      if (destroyed > 0 && dispatch) {
        dispatch(incrementScore(destroyed));
      }
      state.explosions.push({
        x: 0,
        y: 0,
        width: boundsWidth,
        height: boundsHeight,
        frame: 0,
      });
    } else if (powerup.type === POWERUP_TYPES.LIFE) {
      dispatch && dispatch(gainLife());
      state.wingman.hp = Math.min(state.wingman.maxHp, state.wingman.hp + 25);
    } else if (powerup.type === POWERUP_TYPES.INVINCIBLE) {
      state.player.invincibleUntil = now + 8000;
    }
  }

  const score = store.getState().game.score;
  const newLevel = Math.floor(score / 10) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    state.spawnInterval = Math.max(10, state.spawnInterval - 5);
    state.levelDropsMultiplier = Math.min(2.5, 1 + state.level * 0.12);
    state.dropChance = Math.min(0.5, 0.12 + state.level * 0.02);
    state.spawnTimer = 0;
  }

  state.explosions.forEach((explosion) => {
    explosion.frame += deltaFrames;
  });
  state.explosions = state.explosions.filter((explosion) => explosion.frame < 15);
}

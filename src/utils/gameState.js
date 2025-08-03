import { incrementScore } from '../store/gameSlice';

export function createGameState() {
  return {
    player: { x: 400, y: 550, width: 48, height: 48, vx: 0, vy: 0 },
    enemies: [
      { x: 100, y: 50, width: 48, height: 48, vx: 1, vy: 0 },
      { x: 300, y: 50, width: 48, height: 48, vx: -1, vy: 0 },
    ],
    bullets: [],
    explosions: [],
  };
}

export function updateGameState(state, dispatch) {
  state.enemies.forEach((enemy) => {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;
    if (enemy.x < 0 || enemy.x + enemy.width > 800) {
      enemy.vx *= -1;
    }
  });

  state.bullets.forEach((bullet) => {
    bullet.y -= bullet.vy;
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

  state.explosions.forEach((explosion) => {
    explosion.frame += 1;
  });
  state.explosions = state.explosions.filter((explosion) => explosion.frame < 15);
}

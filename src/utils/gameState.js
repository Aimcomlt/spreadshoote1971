export function createGameState() {
  return {
    player: { x: 400, y: 550, width: 48, height: 48, vx: 0, vy: 0 },
    enemies: [
      { x: 100, y: 50, width: 48, height: 48, vx: 1, vy: 0 },
      { x: 300, y: 50, width: 48, height: 48, vx: -1, vy: 0 },
    ],
    bullets: [],
  };
}

export function updateGameState(state) {
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
}

import { createGameState, updateGameState } from './gameState';

test('updateGameState moves enemies and bullets', () => {
  const state = createGameState();
  state.enemies = [{ x: 0, y: 0, width: 10, height: 10, vx: 1, vy: 0 }];
  state.bullets = [{ x: 0, y: 20, width: 5, height: 5, vy: 2 }];
  updateGameState(state, () => {});
  expect(state.enemies[0].x).toBe(1);
  expect(state.bullets[0].y).toBe(18);
});

test('bullet and enemy collision removes both and increments score', () => {
  const state = createGameState();
  state.enemies = [{ x: 0, y: 0, width: 10, height: 10, vx: 0, vy: 0 }];
  state.bullets = [{ x: 0, y: 0, width: 10, height: 10, vy: 0 }];
  const dispatch = jest.fn();
  updateGameState(state, dispatch);
  expect(state.enemies).toHaveLength(0);
  expect(state.bullets).toHaveLength(0);
  expect(dispatch).toHaveBeenCalled();
});

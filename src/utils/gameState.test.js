import { createGameState, updateGameState } from './gameState';
import { store } from '../store';
import { setDifficulty } from '../store/settingsSlice';
import { resetGame } from '../store/gameSlice';

beforeEach(() => {
  store.dispatch(setDifficulty('normal'));
  store.dispatch(resetGame());
});

test('updateGameState moves enemies and bullets', () => {
  const state = createGameState();
  state.enemies = [{ x: 0, y: 0, width: 10, height: 10, vx: 1, vy: 0 }];
  state.bullets = [{ x: 0, y: 20, width: 5, height: 5, vy: 2 }];
  updateGameState(state, () => {}, 1 / 60);
  expect(state.enemies[0].x).toBe(1);
  expect(state.bullets[0].y).toBe(18);
});

test('bullet and enemy collision removes both, creates explosion, and increments score', () => {
  const state = createGameState();
  state.enemies = [{ x: 0, y: 0, width: 10, height: 10, vx: 0, vy: 0 }];
  state.bullets = [{ x: 0, y: 0, width: 10, height: 10, vy: 0 }];
  const dispatch = jest.fn();
  updateGameState(state, dispatch, 1 / 60);
  expect(state.enemies).toHaveLength(0);
  expect(state.bullets).toHaveLength(0);
  expect(state.explosions).toHaveLength(1);
  expect(dispatch).toHaveBeenCalled();
});

test('spawns enemy when spawn timer exceeds interval', () => {
  const state = createGameState();
  state.spawnTimer = state.spawnInterval;
  updateGameState(state, () => {}, 1 / 60);
  expect(state.enemies).toHaveLength(1);
});

test('spawns enemies inside dynamic width bounds', () => {
  const state = createGameState({ width: 120, height: 600 });
  state.spawnTimer = state.spawnInterval;
  updateGameState(state, () => {}, 1 / 60);
  expect(state.enemies).toHaveLength(1);
  expect(state.enemies[0].x).toBeGreaterThanOrEqual(0);
  expect(state.enemies[0].x + state.enemies[0].width).toBeLessThanOrEqual(120);
});

test('enemies bounce against dynamic width bounds', () => {
  const state = createGameState({ width: 100, height: 600 });
  state.enemies = [{ x: 80, y: 0, width: 30, height: 30, vx: 5, vy: 0 }];
  updateGameState(state, () => {}, 1 / 60);
  expect(state.enemies[0].vx).toBe(-5);
  expect(state.enemies[0].x).toBe(70);
});

test('updates spawn interval and timer when difficulty changes', () => {
  const state = createGameState();
  state.spawnTimer = 10;
  store.dispatch(setDifficulty('hard'));
  updateGameState(state, () => {}, 1 / 60);
  expect(state.spawnInterval).toBe(40);
  expect(state.spawnTimer).toBe(1);
});

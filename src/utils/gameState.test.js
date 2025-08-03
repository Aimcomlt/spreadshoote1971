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

test('updates spawn interval and timer when difficulty changes', () => {
  const state = createGameState();
  state.spawnTimer = 10;
  store.dispatch(setDifficulty('hard'));
  updateGameState(state, () => {}, 1 / 60);
  expect(state.spawnInterval).toBe(40);
  expect(state.spawnTimer).toBe(1);
});

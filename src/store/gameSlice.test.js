import reducer, { gainLife, incrementScore } from './gameSlice';

describe('gameSlice adversarial payload hardening', () => {
  test('incrementScore ignores non-finite and non-positive payloads', () => {
    let state = reducer(undefined, { type: '@@INIT' });

    state = reducer(state, incrementScore(-5));
    state = reducer(state, incrementScore(Number.NaN));
    state = reducer(state, incrementScore(Number.POSITIVE_INFINITY));

    expect(state.score).toBe(0);
    expect(state.highScore).toBe(0);
  });

  test('gainLife ignores non-finite and non-positive payloads', () => {
    let state = reducer(undefined, { type: '@@INIT' });

    state = reducer(state, gainLife(-2));
    state = reducer(state, gainLife(Number.NaN));
    state = reducer(state, gainLife(Number.POSITIVE_INFINITY));

    expect(state.lives).toBe(3);
  });

  test('normal positive payloads are applied with integer normalization', () => {
    let state = reducer(undefined, { type: '@@INIT' });

    state = reducer(state, incrementScore(2.9));
    state = reducer(state, gainLife(1.8));

    expect(state.score).toBe(2);
    expect(state.highScore).toBe(2);
    expect(state.lives).toBe(4);
  });
});

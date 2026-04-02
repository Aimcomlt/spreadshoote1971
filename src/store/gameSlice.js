import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  score: 0,
  lives: 3,
  isGameOver: false,
  highScore: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    incrementScore: (state, action) => {
      const rawAmount = action.payload ?? 1;
      const amount =
        Number.isFinite(rawAmount) && rawAmount > 0 ? Math.floor(rawAmount) : 0;
      state.score += amount;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    },
    playerDamaged: (state) => {
      if (state.lives > 0) state.lives -= 1;
      if (state.lives <= 0) state.isGameOver = true;
    },
    gainLife: (state, action) => {
      const amount = action.payload ?? 1;
      const normalizedAmount =
        Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
      state.lives += normalizedAmount;
    },
    resetGame: (state) => {
      state.score = 0;
      state.lives = initialState.lives;
      state.isGameOver = false;
    },
  },
});

export const { incrementScore, playerDamaged, gainLife, resetGame } = gameSlice.actions;
export default gameSlice.reducer;

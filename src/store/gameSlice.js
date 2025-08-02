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
      state.score += action.payload ?? 1;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    },
    playerDamaged: (state) => {
      if (state.lives > 0) state.lives -= 1;
      if (state.lives <= 0) state.isGameOver = true;
    },
    resetGame: (state) => {
      state.score = 0;
      state.lives = initialState.lives;
      state.isGameOver = false;
    },
  },
});

export const { incrementScore, playerDamaged, resetGame } = gameSlice.actions;
export default gameSlice.reducer;

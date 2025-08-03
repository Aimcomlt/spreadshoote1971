import { createSlice } from '@reduxjs/toolkit';

// Configuration for each difficulty level. This centralizes the enemy
// behaviour so game logic can adjust spawn timing and speed according to the
// player's preference.
export const DIFFICULTY_CONFIG = {
  easy: { enemySpeed: 1, spawnInterval: 120 },
  normal: { enemySpeed: 2, spawnInterval: 80 },
  hard: { enemySpeed: 3, spawnInterval: 40 },
};

const initialState = {
  soundOn: true,
  difficulty: 'normal',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSound: (state) => {
      state.soundOn = !state.soundOn;
    },
    setDifficulty: (state, action) => {
      state.difficulty = action.payload;
    },
  },
});

export const { toggleSound, setDifficulty } = settingsSlice.actions;
export default settingsSlice.reducer;

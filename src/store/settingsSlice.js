import { createSlice } from '@reduxjs/toolkit';

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

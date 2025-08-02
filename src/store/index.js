import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    settings: settingsReducer,
  },
});


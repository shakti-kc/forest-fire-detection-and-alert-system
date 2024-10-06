import { configureStore } from '@reduxjs/toolkit';
import basemapReducer from './basemapSlice';
import fireDataReducer from './fireDataSlice';

export const store = configureStore({
  reducer: {
    basemap: basemapReducer,
    fireDate: fireDataReducer,
  },
});

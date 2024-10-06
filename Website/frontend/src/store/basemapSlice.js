import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  basemap: 'osm',
};

const basemapSlice = createSlice({
  name: 'basemap',
  initialState,
  reducers: {
    setBasemap: (state, action) => {
      state.basemap = action.payload;
    },
  },
});

export const { setBasemap } = basemapSlice.actions;
export default basemapSlice.reducer;

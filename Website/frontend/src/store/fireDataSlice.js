import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedDate: '',
  nasaFireData: null,
};

const fireDateSlice = createSlice({
  name: 'fireDate',
  initialState,
  reducers: {
    setFireDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setNasaFireData: (state, action) => {
      state.nasaFireData = action.payload;
    },
  },
});

export const { setFireDate, setNasaFireData } = fireDateSlice.actions;
export default fireDateSlice.reducer;

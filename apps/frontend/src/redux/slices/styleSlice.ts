import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface IStyleState {
  sidebarStatus: boolean;
  darkMode: boolean;
}

const initialState: IStyleState = {
  sidebarStatus: true,
  // Always start light on SSR; ThemeProvider hydrates from localStorage.
  darkMode: false,
};

export const styleSlice = createSlice({
  name: 'style',
  initialState,
  reducers: {
    TOGGLE_SIDEBAR: (state) => {
      state.sidebarStatus = !state.sidebarStatus;
    },
    TOGGLE_DARK_MODE: (state) => {
      state.darkMode = !state.darkMode;
    },
    SET_DARK_MODE: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
  },
});

export const { TOGGLE_SIDEBAR, TOGGLE_DARK_MODE, SET_DARK_MODE } = styleSlice.actions;

export default styleSlice.reducer;

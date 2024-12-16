import { createSlice } from '@reduxjs/toolkit';

type StyleReduxSliceType = {
  sidebarStatus: boolean;
  darkMode: boolean;
};

const prefersDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState: StyleReduxSliceType = {
  sidebarStatus: true,
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : prefersDarkMode,
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
      localStorage.setItem('darkMode', String(state.darkMode));
    },
  },
});

export const { TOGGLE_SIDEBAR, TOGGLE_DARK_MODE } = styleSlice.actions;

export default styleSlice.reducer;

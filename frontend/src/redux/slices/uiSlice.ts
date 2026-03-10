import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  darkMode: boolean;
}

const getInitialDarkMode = () => {
  try {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return JSON.parse(stored);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
};

const initialState: UIState = {
  darkMode: getInitialDarkMode(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
  },
});

export const { toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;

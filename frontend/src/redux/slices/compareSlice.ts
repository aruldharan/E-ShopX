import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface CompareState {
  items: any[];
}

const initialState: CompareState = { items: [] };

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<any>) => {
      if (state.items.length >= 4) return; // max 4 at once
      if (!state.items.find((p) => p._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
    },
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } =
  compareSlice.actions;
export default compareSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  items: string[];
}

const storedWishlist = localStorage.getItem("wishlist");
const initialState: WishlistState = {
  items: storedWishlist ? JSON.parse(storedWishlist) : [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.items.includes(id)) {
        state.items = state.items.filter((i) => i !== id);
      } else {
        state.items.push(id);
      }
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem("wishlist");
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

import { BannerData } from "@/src/types/banner";
import { createSlice } from "@reduxjs/toolkit";

interface BannerSliceState {
  data: BannerData[];
  error: Error | null;
}

const initialState: BannerSliceState = {
  data: [],
  error: null,
};

export const regionSlice = createSlice({
  name: "bannerData",
  initialState,
  reducers: {
    setBannerData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setBannerData } = regionSlice.actions;

export default regionSlice.reducer;

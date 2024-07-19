import { SportTypesData } from "@/src/types/sportType";
import { createSlice } from "@reduxjs/toolkit";

interface SportTypesState {
  isLoading: boolean;
  data: SportTypesData[];
  error: Error | null;
}

const initialState: SportTypesState = {
  isLoading: true,
  data: [],
  error: null,
};

export const regionSlice = createSlice({
  name: "sportTypesData",
  initialState,
  reducers: {
    setSportTypesData: (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setSportTypesData } = regionSlice.actions;

export default regionSlice.reducer;

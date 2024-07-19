import { OwnerDataType } from "@/src/types/owner";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

interface OwnerSliceState {
  isLoading: boolean;
  data: OwnerDataType[];
  error: Error | null;
}

const initialState: OwnerSliceState = {
  isLoading: false,
  data: [],
  error: null,
};


export const ownerSlice = createSlice({
  name: "ownerData",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setOwnerDatas: (state, action) => {
      state.data = action.payload;
    },
  },
}); 

export const { setIsLoading, setOwnerDatas } = ownerSlice.actions;
export const selectOwner = (state: RootState) => state.owner;

export default ownerSlice.reducer;

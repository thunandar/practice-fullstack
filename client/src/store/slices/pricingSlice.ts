import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PricingDataType } from "@/src/types/pricing";

interface PricingSliceState {
  isLoading: boolean;
  data: PricingDataType[];
  error: Error | null;
}

const initialState: PricingSliceState = {
  isLoading: false,
  data: [],
  error: null,
};

export const pricingSlice = createSlice({
  name: "pricingData",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setPricingData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setIsLoading, setPricingData } = pricingSlice.actions;

export default pricingSlice.reducer;

import { RegionDataType } from "@/src/types/region";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface RegionSliceState {
  regionData: RegionDataType[];
  error: Error | null;
}


const initialState: RegionSliceState = {
  regionData: [],
  error: null,
};

export const regionSlice = createSlice({
  name: "regionData",
  initialState,
  reducers: {
    setRegionData: (state, action) => {
      state.regionData = action.payload;
    },
    removeRegion: (state, action: PayloadAction<RegionDataType>) => {
      state.regionData = state.regionData.filter(
        (item) => item.id !== action.payload.id
      );
    },
  }, 
});

export const { setRegionData, removeRegion } = regionSlice.actions;

export default regionSlice.reducer;

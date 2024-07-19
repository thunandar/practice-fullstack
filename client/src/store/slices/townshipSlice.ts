import { TownshipDataType } from "@/src/types/township";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface TownshipSliceState {
  townshipData: TownshipDataType[];
  error: Error | null;
}

const initialState: TownshipSliceState = {
  townshipData: [],
  error: null,
};

export const townshipSlice = createSlice({
  name: "townshipData",
  initialState,
  reducers: {
    setTownshipData: (state, action) => {
      state.townshipData = action.payload;
    },
    removeTownship: (state, action: PayloadAction<TownshipDataType>) => {
      state.townshipData = state.townshipData.filter(
        (item) => item.id !== action.payload.id
      );
    },
  },
});

export const { setTownshipData, removeTownship } = townshipSlice.actions;

export default townshipSlice.reducer;

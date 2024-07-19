import { ContactMessageData } from "@/src/types/help";
import { createSlice } from "@reduxjs/toolkit";

interface HelpAndSupportState {
  data: ContactMessageData[];
  error: Error | null;
}

const initialState: HelpAndSupportState = {
  data: [],
  error: null,
};

export const helpAndSupportSlice = createSlice({
  name: "helpAndSupportData",
  initialState,
  reducers: {
    setHelpAndSupportData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setHelpAndSupportData } = helpAndSupportSlice.actions;

export default helpAndSupportSlice.reducer;

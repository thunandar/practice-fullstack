import { UserData } from "@/src/types/user";
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  data: UserData[];
  isLoading: boolean;
  error: Error | null;
}

const initialState: UserState = {
  data: [],
  isLoading: true,
  error: null,
};

const userSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;

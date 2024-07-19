import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AdminDataType } from "@/src/types/admin";

interface AdminSliceState {
  adminData: AdminDataType[];
  error: Error | null;
}

const initialState: AdminSliceState = {
  adminData: [],
  error: null,
};

export const adminSlice = createSlice({
  name: "adminData",
  initialState,
  reducers: {
    setAdminData: (state, action) => {
      state.adminData = action.payload;
    },
    addAdmin: (state, action: PayloadAction<AdminDataType>) => {
      state.adminData = [action.payload, ...state.adminData];
    },
    updateAdmin: (state, action: PayloadAction<AdminDataType>) => {
      state.adminData = state.adminData.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },
    removeAdmin: (state, action: PayloadAction<AdminDataType>) => {
      state.adminData = state.adminData.filter(
        (item) => item.id !== action.payload.id
      );
    },
  },
});

export const { setAdminData, addAdmin, updateAdmin, removeAdmin } =
  adminSlice.actions;

export default adminSlice.reducer;

import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface CredentialType {
  page: number;
  per_page: number;
}

interface GlobalSliceState {
  isFetchLoading: boolean;
  credential: CredentialType;
  createLoading: boolean;
  editLoading: boolean;
  deleteLoading: boolean;
  fetchDataStatus: boolean;
  total_count: number;
  error: Error | null;
}

const initialState: GlobalSliceState = {
  isFetchLoading: false,
  credential: {
    page: 1,
    per_page: 10,
  },
  createLoading: false,
  editLoading: false,
  deleteLoading: false,
  fetchDataStatus: false,
  total_count: 0,
  error: null,
};

export const regionSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFetchLoading: (state, action: PayloadAction<boolean>) => {
      state.isFetchLoading = action.payload;
    },
    setPage: (state, action) => {
      state.credential.page = action.payload;
    },
    setTotal_count: (state, action) => {
      state.total_count = action.payload;
    },
    setPerPage: (state, action) => {
      state.credential.per_page = action.payload;
    },
    setCreateLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },
    setEditLoading: (state, action: PayloadAction<boolean>) => {
      state.editLoading = action.payload;
    },
    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },
    setFetchDataStatus: (state, action: PayloadAction<boolean>) => {
      state.fetchDataStatus = action.payload;
    },
  },
});

export const {
  setFetchLoading,
  setCreateLoading,
  setEditLoading,
  setDeleteLoading,
  setPage,
  setPerPage,
  setFetchDataStatus,
  setTotal_count,
} = regionSlice.actions;

export default regionSlice.reducer;

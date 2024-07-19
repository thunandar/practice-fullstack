import { configureStore } from "@reduxjs/toolkit";
import ownerSlice from "./slices/ownerSlice";
import userSlice from "./slices/userSlice";
import adminSlice from "./slices/adminSlice";
import regionSlice from "./slices/regionSlice";
import sportTypesSlice from "./slices/sportTypesSlice";
import bannerSlice from "./slices/bannerSlice";
import helpAndSupportSlice from "./slices/helpAndSupportSlice";
import globalSlice from "./slices/globalSlice";
import townshipSlice from "./slices/townshipSlice";
import pricingSlice from "./slices/pricingSlice";

// ...

export const store = configureStore({
  reducer: {
    global: globalSlice,
    owner: ownerSlice,
    user: userSlice,
    admin: adminSlice,
    region: regionSlice,
    township: townshipSlice,
    sportTypes: sportTypesSlice,
    banner: bannerSlice,
    helpAndSupport: helpAndSupportSlice,
    pricing: pricingSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

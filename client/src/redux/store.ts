import { combineReducers, configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import userReducer from './slices/userSlice';
import styleReducer from './slices/styleSlice';
import { createLogger } from 'redux-logger';
const reducer = combineReducers({
  audio: audioReducer,
  user: userReducer,
  style: styleReducer,
});

const logger = createLogger();

export const store = configureStore({
  reducer,
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(logger);
  },
});

export type RootState = ReturnType<typeof store.getState>;

// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import { audioSlice } from "./slices/audioSlice";

// const reducer = combineReducers({
//   audio: audioSlice,
// });

// export const makeStore = () => {
//   return configureStore({
//     reducer,
//   });
// };

// // Infer the type of makeStore
// export type AppStore = ReturnType<typeof makeStore>;
// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<AppStore["getState"]>;
// export type AppDispatch = AppStore["dispatch"];

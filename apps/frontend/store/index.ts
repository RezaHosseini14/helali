import { combineReducers, configureStore } from '@reduxjs/toolkit';

import audioReducer from '@/src/redux/slices/audioSlice';
import styleReducer from '@/src/redux/slices/styleSlice';
import userReducer from '@/src/redux/slices/userSlice';

const reducer = combineReducers({
  audio: audioReducer,
  user: userReducer,
  style: styleReducer,
});

export const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

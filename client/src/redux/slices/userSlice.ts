import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { userType } from 'types/user.type';

type userInitialStateType = {
  user: userType;
  userLoading: boolean;
};

const initialState: userInitialStateType = {
  user: {
    id: 0,
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    age: 0,
    email: '',
    refresh_token: '',
    created_at: new Date(),
  },
  userLoading: true,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    SET_USER_DATA: (state, action: PayloadAction<userType>) => {
      state.user = action.payload;
    },
    SET_USER_DATA_LOADING: (state, action: PayloadAction<boolean>) => {
      state.userLoading = action.payload;
    },
  },
});

export const { SET_USER_DATA, SET_USER_DATA_LOADING } = userSlice.actions;

export default userSlice.reducer;

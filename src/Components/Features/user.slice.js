import { createSlice } from '@reduxjs/toolkit';

const initialState={
  error:null,
  loading:false,
  user:null
}

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    userLoggedIn: (state, action) => {
     state.user=action.payload
    },
    userLoggedOut: (state) => {
     state.user=null
    },
  },
});

export const { userLoggedIn, userLoggedOut } = userSlice.actions;
export default userSlice.reducer;
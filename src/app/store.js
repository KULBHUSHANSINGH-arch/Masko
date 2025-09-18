import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import userReducer from '../Components/Features/user.slice.js';
const persistConfig = {
  key: 'user',
  storage,
};
const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Configure Store
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
   
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);
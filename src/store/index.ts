import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/Settings';
import searchReducer from './slices/Search';
import { localStorageMiddleware } from './middleware/LocalStorageMiddleware';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

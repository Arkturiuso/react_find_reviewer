import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  excludeBots: boolean;
  login: string;
  repo: string;
  blacklist: string[];
}

const initialState: SettingsState = {
  excludeBots: false,
  login: '',
  repo: '',
  blacklist: [],
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setExcludeBots: (state, action: PayloadAction<boolean>) => {
      state.excludeBots = action.payload;
    },
    setLogin: (state, action: PayloadAction<string>) => {
      state.login = action.payload;
    },
    setRepo: (state, action: PayloadAction<string>) => {
      state.repo = action.payload;
    },
    setBlacklist: (state, action: PayloadAction<string[]>) => {
      state.blacklist = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setExcludeBots,
  setLogin,
  setRepo,
  setBlacklist,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

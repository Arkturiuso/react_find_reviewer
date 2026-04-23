import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GitHubUser } from '../../types';

interface SearchState {
  currentUser: GitHubUser | null;
  filteredReviewers: GitHubUser[];
  loading: boolean;
  hasSearched: boolean;
  error: string;
  isRolling: boolean;
  rollingCandidate: GitHubUser | null;
  selectedReviewer: GitHubUser | null;
}

const initialState: SearchState = {
  currentUser: null,
  filteredReviewers: [],
  loading: false,
  hasSearched: false,
  error: '',
  isRolling: false,
  rollingCandidate: null,
  selectedReviewer: null,
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<GitHubUser | null>) => {
      state.currentUser = action.payload;
    },
    setFilteredReviewers: (state, action: PayloadAction<GitHubUser[]>) => {
      state.filteredReviewers = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setHasSearched: (state, action: PayloadAction<boolean>) => {
      state.hasSearched = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setIsRolling: (state, action: PayloadAction<boolean>) => {
      state.isRolling = action.payload;
    },
    setRollingCandidate: (state, action: PayloadAction<GitHubUser | null>) => {
      state.rollingCandidate = action.payload;
    },
    setSelectedReviewer: (state, action: PayloadAction<GitHubUser | null>) => {
      state.selectedReviewer = action.payload;
    },
    clearSearch: () => initialState,
  },
});

export const {
  setCurrentUser,
  setFilteredReviewers,
  setLoading,
  setHasSearched,
  setError,
  setIsRolling,
  setRollingCandidate,
  setSelectedReviewer,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;

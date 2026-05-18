import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profilesAPI } from '@/api';
import type { EmployerProfile, SeekerProfile } from '@/types';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

interface ProfileState {
  employerProfile: EmployerProfile | null;
  seekerProfile: SeekerProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  employerProfile: null,
  seekerProfile: null,
  isLoading: false,
  error: null,
};

export const fetchEmployerProfile = createAsyncThunk(
  'profile/fetchEmployer',
  async (_, { rejectWithValue }) => {
    try {
      return await profilesAPI.getEmployerProfile();
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch employer profile'));
    }
  },
);

export const updateEmployerProfile = createAsyncThunk(
  'profile/updateEmployer',
  async (data: FormData, { rejectWithValue }) => {
    try {
      return await profilesAPI.updateEmployerProfile(data);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update employer profile'));
    }
  },
);

export const fetchSeekerProfile = createAsyncThunk(
  'profile/fetchSeeker',
  async (_, { rejectWithValue }) => {
    try {
      return await profilesAPI.getSeekerProfile();
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch seeker profile'));
    }
  },
);

export const updateSeekerProfile = createAsyncThunk(
  'profile/updateSeeker',
  async (data: FormData, { rejectWithValue }) => {
    try {
      return await profilesAPI.updateSeekerProfile(data);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update seeker profile'));
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfiles: (state) => {
      state.employerProfile = null;
      state.seekerProfile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch employer profile
    builder.addCase(fetchEmployerProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.employerProfile = action.payload;
    });
    builder.addCase(fetchEmployerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update employer profile
    builder.addCase(updateEmployerProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateEmployerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.employerProfile = action.payload;
    });
    builder.addCase(updateEmployerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch seeker profile
    builder.addCase(fetchSeekerProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSeekerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.seekerProfile = action.payload;
    });
    builder.addCase(fetchSeekerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update seeker profile
    builder.addCase(updateSeekerProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateSeekerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.seekerProfile = action.payload;
    });
    builder.addCase(updateSeekerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearProfiles } = profileSlice.actions;
export default profileSlice.reducer;

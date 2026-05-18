import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobsAPI } from '@/api';
import type { JobListItem, JobDetail, JobCategory, JobFilters, PaginatedResponse } from '@/types';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

interface JobsState {
  jobs: PaginatedResponse<JobListItem> | null;
  currentJob: JobDetail | null;
  categories: JobCategory[];
  filters: JobFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: null,
  currentJob: null,
  categories: [],
  filters: {},
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (filters: JobFilters | undefined, { rejectWithValue }) => {
    try {
      return await jobsAPI.getJobs(filters);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch jobs'));
    }
  },
);

export const fetchJobDetail = createAsyncThunk(
  'jobs/fetchJobDetail',
  async (slug: string, { rejectWithValue }) => {
    try {
      return await jobsAPI.getJob(slug);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch job'));
    }
  },
);

export const fetchCategories = createAsyncThunk(
  'jobs/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await jobsAPI.getCategories();
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch categories'));
    }
  },
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder.addCase(fetchJobs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.jobs = action.payload;
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch job detail
    builder.addCase(fetchJobDetail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJobDetail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentJob = action.payload;
    });
    builder.addCase(fetchJobDetail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch categories
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });
  },
});

export const { setFilters, clearFilters, clearCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/api';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Invalid credentials');
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: Record<string, string[]> } };
      const errorData = err.response?.data;
      if (errorData) {
        const firstError = Object.values(errorData)[0];
        return rejectWithValue(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
      }
      return rejectWithValue('Registration failed');
    }
  },
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleLogin(token);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(err.response?.data?.error || 'Google login failed');
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.getCurrentUser();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      // Return success to trigger fulfilled case
      return { success: true };
    } catch (error) {
      // Logout API failure shouldn't prevent local logout
      console.error('Logout API error:', error);
      // Still clear local state even if API fails
      return rejectWithValue('Logout failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Google Login
    builder.addCase(googleLoginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(googleLoginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(googleLoginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

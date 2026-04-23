import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface AuthState {
  user:    { id: string; name: string; email: string; role: string } | null;
  token:   string | null;
  loading: boolean;
  error:   string | null;
}

const initialState: AuthState = {
  user:    null,
  token:   localStorage.getItem('adminToken'),
  loading: false,
  error:   null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res: any = await api.post('/users/login', credentials);
      localStorage.setItem('adminToken', res.data.token);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('adminToken');
    },
    setCredentials: (state, action) => {
      state.user  = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(loginAsync.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        s.token   = a.payload.token;
      })
      .addCase(loginAsync.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface ContentBlock {
  _id:      string;
  key:      string;
  page:     string;
  title:    string;
  subtitle: string;
  body:     string;
  cta:      string;
  image:    string;
  extra:    any;
}

interface ContentState {
  blocks:  ContentBlock[];
  hero:    ContentBlock | null;
  loading: boolean;
  error:   string | null;
}

const initialState: ContentState = {
  blocks: [], hero: null, loading: false, error: null,
};

export const fetchContentByPage = createAsyncThunk(
  'content/fetchByPage',
  async (page: string, { rejectWithValue }) => {
    try {
      const res: any = await api.get(`/content/page/${page}`);
      return res.data as ContentBlock[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch content');
    }
  }
);

export const fetchAllContent = createAsyncThunk(
  'content/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res: any = await api.get('/content');
      return res.data as ContentBlock[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch content');
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllContent.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAllContent.fulfilled,  (s, a) => {
        s.loading = false;
        s.blocks  = a.payload;
        s.hero    = a.payload.find(b => b.key === 'hero') || null;
      })
      .addCase(fetchAllContent.rejected,   (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchContentByPage.fulfilled, (s, a) => {
        s.blocks = a.payload;
        s.hero   = a.payload.find(b => b.key === 'hero') || s.hero;
      });
  },
});

export default contentSlice.reducer;

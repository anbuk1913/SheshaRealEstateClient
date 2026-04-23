import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface Blog {
  _id:        string;
  title:      string;
  slug:       string;
  excerpt:    string;
  coverImage: string;
  author:     string;
  tags:       string[];
  published:  boolean;
  createdAt:  string;
}

interface BlogState {
  items:    Blog[];
  selected: Blog | null;
  loading:  boolean;
  error:    string | null;
}

const initialState: BlogState = {
  items: [], selected: null, loading: false, error: null,
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res: any = await api.get('/blogs');
      return res.data as Blog[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchBlog = createAsyncThunk(
  'blogs/fetchOne',
  async (slug: string, { rejectWithValue }) => {
    try {
      const res: any = await api.get(`/blogs/${slug}`);
      return res.data as Blog;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch blog');
    }
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBlogs.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchBlogs.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchBlog.fulfilled,  (s, a) => { s.selected = a.payload; });
  },
});

export const { clearSelected } = blogSlice.actions;
export default blogSlice.reducer;

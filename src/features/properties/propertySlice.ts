import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchPropertiesAPI, fetchFeaturedAPI } from './propertAPI';

interface PropertyState {
  items:       any[];
  featured:    any[];
  selected:    any | null;
  loading:     boolean;
  error:       string | null;
  pagination:  { page: number; total: number; totalPages: number };
  filters:     { category: string; location: string; status: string; search: string };
}

const initialState: PropertyState = {
  items: [], featured: [], selected: null,
  loading: false, error: null,
  pagination: { page: 1, total: 0, totalPages: 1 },
  filters: { category: '', location: '', status: '', search: '' },
};

export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (params: any) => fetchPropertiesAPI(params)
);

export const fetchFeatured = createAsyncThunk(
  'properties/featured',
  async () => fetchFeaturedAPI()
);

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof state.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProperties.fulfilled, (s, a) => {
        s.loading = false; s.items = a.payload.data;
        s.pagination = { page: a.payload.meta.page, total: a.payload.meta.total, totalPages: a.payload.meta.totalPages };
      })
      .addCase(fetchProperties.rejected,  (s, a) => { s.loading = false; s.error = a.error.message!; })
      .addCase(fetchFeatured.fulfilled,   (s, a) => { s.featured = a.payload.data; });
  },
});

export const { setFilters, clearSelected } = propertySlice.actions;
export default propertySlice.reducer;
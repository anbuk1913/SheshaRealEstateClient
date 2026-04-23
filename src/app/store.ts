import { configureStore } from '@reduxjs/toolkit';
import propertyReducer from '../features/properties/propertySlice';
import blogReducer     from '../features/blog/blogSlice';
import contentReducer  from '../features/content/contentSlice';
import authReducer     from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    properties: propertyReducer,
    blogs:      blogReducer,
    content:    contentReducer,
    auth:       authReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './src/app/store';

import Home             from './src/pages/Home';
import Properties       from './src/pages/Properties';
import PropertyDetail   from './src/pages/PropertyDetail';
import About            from './src/pages/About';
import Blog             from './src/pages/Blog';
import Contact          from './src/pages/Contact';
import Dashboard        from './src/pages/admin/Dashboard';
import ManageProperties from './src/pages/admin/ManageProperties';
import ManageBlogs      from './src/pages/admin/ManageBlogs';
import ManageContent    from './src/pages/admin/ManageContent';

import './src/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                 element={<Home />} />
          <Route path="/properties"       element={<Properties />} />
          <Route path="/properties/:slug" element={<PropertyDetail />} />
          <Route path="/about"            element={<About />} />
          <Route path="/blog"             element={<Blog />} />
          <Route path="/contact"          element={<Contact />} />

          {/* Admin — Dashboard handles its own auth/login */}
          <Route path="/admin"                    element={<Dashboard />} />
          <Route path="/admin/properties"         element={<ManageProperties />} />
          <Route path="/admin/blogs"              element={<ManageBlogs />} />
          <Route path="/admin/content"            element={<ManageContent />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

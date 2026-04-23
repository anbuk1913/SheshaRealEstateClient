import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { fetchBlogs } from '../features/blog/blogSlice';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BlogCard } from '../components/BlogCard';
import { FileText } from 'lucide-react';

export default function Blog() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: blogs, loading } = useSelector((s: RootState) => s.blogs);

  useEffect(() => { dispatch(fetchBlogs()); }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={22} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Real Estate Insights</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">Expert tips, market trends, and property guides to help you make informed decisions.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b: any) => <BlogCard key={b._id} blog={b} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <FileText size={40} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium mb-1">No articles yet</p>
              <p className="text-sm">Check back soon for expert insights.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

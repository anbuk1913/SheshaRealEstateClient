import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { fetchFeatured } from '../features/properties/propertySlice';
import { fetchAllContent } from '../features/content/contentSlice';
import { fetchBlogs } from '../features/blog/blogSlice';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/HeroSection';
import { PropertyCard } from '../components/PropertyCard';
import { BlogCard } from '../components/BlogCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Users, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Properties Listed',  value: '2,400+', icon: TrendingUp },
  { label: 'Happy Clients',      value: '1,800+', icon: Users },
  { label: 'Years Experience',   value: '12+',    icon: Award },
  { label: 'Cities Covered',     value: '15+',    icon: Shield },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { featured, loading } = useSelector((s: RootState) => s.properties);
  const { items: blogs }      = useSelector((s: RootState) => s.blogs);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchAllContent());
    dispatch(fetchBlogs());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Stats */}
        <section className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-amber-500 text-sm font-medium uppercase tracking-wider mb-1">Handpicked</p>
                <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              </div>
              <Link to="/properties" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                : featured.slice(0, 6).map((p: any) => <PropertyCard key={p._id} property={p} />)
              }
            </div>
            {!loading && featured.length === 0 && (
              <p className="text-center text-gray-400 py-12">No featured properties yet.</p>
            )}
            <div className="sm:hidden mt-6 text-center">
              <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                View All Properties <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Blogs */}
        {blogs.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-amber-500 text-sm font-medium uppercase tracking-wider mb-1">Insights</p>
                  <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                </div>
                <Link to="/blog" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
                  All Articles <ArrowRight size={15} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.slice(0, 3).map((b: any) => <BlogCard key={b._id} blog={b} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

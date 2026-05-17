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
  { label: 'Properties Listed', value: '2,400+', icon: TrendingUp },
  { label: 'Happy Clients',     value: '1,800+', icon: Users },
  { label: 'Years Experience',  value: '12+',    icon: Award },
  { label: 'Cities Covered',    value: '15+',    icon: Shield },
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

        {/* ── Stats ── */}
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

        {/* ── Featured Properties ── */}
        <section className="relative py-16 overflow-hidden bg-white">

          {/* Soft amber radial glow — top right */}
          <div
            className="absolute -top-32 -right-32 w-[550px] h-[550px] z-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 65%)' }}
          />

          {/* Soft amber radial glow — bottom left */}
          <div
            className="absolute -bottom-32 -left-32 w-[420px] h-[420px] z-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 65%)' }}
          />

          {/* Dot grid pattern — fades toward edges */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(180,130,40,0.12) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}
          />

          {/* Top amber border accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px z-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.4) 40%, rgba(245,158,11,0.4) 60%, transparent)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="flex items-center gap-2 text-amber-500 text-xs font-medium uppercase tracking-widest mb-2">
                  <span className="block w-6 h-px bg-amber-500" />
                  Handpicked
                </p>
                <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              </div>
              <Link
                to="/properties"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                View All <ArrowRight size={14} />
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
                View All Properties <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Latest Blogs ── */}
        {blogs.length > 0 && (
          <section className="relative py-16 overflow-hidden" style={{ background: '#fffbf4' }}>

            {/* Diagonal soft stripe bands */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -55deg,
                  transparent,
                  transparent 40px,
                  rgba(245,158,11,0.04) 40px,
                  rgba(245,158,11,0.04) 80px
                )`,
              }}
            />

            {/* Large circle ring — top left */}
            <div
              className="absolute -top-24 -left-24 w-80 h-80 z-0 pointer-events-none rounded-full"
              style={{ border: '40px solid rgba(251,191,36,0.08)' }}
            />

            {/* Large circle ring — bottom right */}
            <div
              className="absolute -bottom-20 -right-20 w-64 h-64 z-0 pointer-events-none rounded-full"
              style={{ border: '30px solid rgba(245,158,11,0.07)' }}
            />

            {/* Center soft amber glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] z-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.09) 0%, transparent 70%)' }}
            />

            {/* Bottom border accent line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px z-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.3) 40%, rgba(245,158,11,0.3) 60%, transparent)',
              }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="flex items-center gap-2 text-amber-500 text-xs font-medium uppercase tracking-widest mb-2">
                    <span className="block w-6 h-px bg-amber-500" />
                    Insights
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                </div>
                <Link
                  to="/blog"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  All Articles <ArrowRight size={14} />
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
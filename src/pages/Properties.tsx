import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../app/store';
import { fetchProperties, setFilters } from '../features/properties/propertySlice';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const statusOptions = ['', 'available', 'sold', 'rented'];

export default function Properties() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const { items, loading, pagination, filters } = useSelector((s: RootState) => s.properties);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(fetchProperties({ ...filters, page: pagination.page }));
  }, [filters, pagination.page, dispatch]);

  const changePage = (p: number) => {
    dispatch(fetchProperties({ ...filters, page: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Properties</h1>
            <p className="text-gray-500 text-sm">{pagination.total} properties found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 flex flex-wrap gap-3 items-center">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <div className="flex-1 min-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400"
              />
            </div>
            <select
              value={filters.status}
              onChange={e => dispatch(setFilters({ status: e.target.value }))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-amber-400 text-gray-700"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : items.map((p: any) => <PropertyCard key={p._id} property={p} />)
            }
          </div>

          {!loading && items.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium mb-2">No properties found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === pagination.page
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

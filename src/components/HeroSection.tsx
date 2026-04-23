import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const { hero } = useSelector((s: RootState) => s.content);
  const [search, setSearch] = useState('');
  const nav = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <img
        src={'/Bannerr.jpeg'}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20" />
      <div className="relative z-10 text-center text-white max-w-3xl px-6">
        <p className="text-amber-400 font-medium tracking-widest text-sm uppercase mb-4">
          {hero?.subtitle || 'Find Your Dream Property'}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          {hero?.title || 'Discover Premium Real Estate'}
        </h1>
        <p className="text-white/80 text-lg mb-10">{hero?.body}</p>
        <div className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-2xl max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by city, area or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nav(`/properties?search=${search}`)}
            className="flex-1 px-4 py-3 text-gray-900 outline-none text-sm bg-transparent"
          />
          <button
            onClick={() => nav(`/properties?search=${search}`)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors">
            <Search size={16} /> Search
          </button>
        </div>
      </div>
    </section>
  );
};
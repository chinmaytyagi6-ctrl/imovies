import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film, Star, RotateCcw } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Crime', 'Biography', 'Animation', 'Comedy'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Spanish'];
const STATUSES = [
  { label: 'All Movies', value: 'all' },
  { label: 'Now Showing', value: 'now_showing' },
  { label: 'Popular', value: 'popular' },
  { label: 'Upcoming', value: 'upcoming' },
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'latest');

  // Trailer
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    // Sync URL params into state if changed externally
    if (searchParams.get('search')) setSearchQuery(searchParams.get('search'));
    if (searchParams.get('status')) setSelectedStatus(searchParams.get('status'));
  }, [searchParams]);

  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (selectedGenre !== 'All') params.append('genre', selectedGenre);
        if (selectedLanguage !== 'All') params.append('language', selectedLanguage);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (selectedSort) params.append('sort', selectedSort);

        const res = await api.get(`/movies?${params.toString()}`);
        setMovies(res.data.data || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchFilteredMovies();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGenre, selectedLanguage, selectedStatus, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedStatus('all');
    setSelectedSort('latest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Explore Movies
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search and filter through currently showing blockbusters, IMAX screenings, and upcoming titles.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-cinema-card p-5 rounded-3xl border border-cinema-border/80 shadow-xl mb-10 space-y-4">
        
        {/* Top Row: Search Input + Status Pills */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Field */}
          <div className="relative flex-grow max-w-lg">
            <input
              type="text"
              placeholder="Search by movie title, director, cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-cinema-border text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cinema-accent transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-cinema-border/50">
            {STATUSES.map((st) => (
              <button
                key={st.value}
                onClick={() => setSelectedStatus(st.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedStatus === st.value
                    ? 'bg-cinema-accent text-white shadow-glow-red'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

        </div>

        {/* Bottom Row: Genre dropdown/chips, Language, Sorting */}
        <div className="pt-3 border-t border-cinema-border/40 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Genre:
            </span>
            {GENRES.slice(0, 7).map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedGenre === genre
                    ? 'bg-slate-200 text-slate-950 font-bold'
                    : 'bg-cinema-cardLight text-slate-400 hover:text-slate-200 border border-cinema-border/40'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Language and Sort select */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Lang:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-900 border border-cinema-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cinema-accent"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-slate-900 border border-cinema-border rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cinema-accent"
              >
                <option value="latest">Latest Releases</option>
                <option value="rating_desc">Highest IMDb Rating</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-1.5 text-slate-400 hover:text-cinema-accent rounded-lg hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="aspect-[2/3] bg-cinema-card animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onWatchTrailer={(m) => {
                setTrailerMovie(m);
                setIsTrailerOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-cinema-card rounded-3xl border border-cinema-border">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any movies matching your current filters. Try searching with different keywords or reset your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-cinema-accent text-white text-xs font-semibold hover:bg-cinema-accentHover transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        movie={trailerMovie}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />

    </div>
  );
};

export default Movies;

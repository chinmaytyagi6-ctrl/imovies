import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Ticket, Star, Clock, Search, Sparkles, ChevronRight, Volume2, Film, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies');
        setMovies(res.data.data || []);
      } catch (err) {
        console.error('Failed to load movies', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleWatchTrailer = (movie) => {
    setTrailerMovie(movie);
    setIsTrailerOpen(true);
  };

  const featuredMovie = movies[0] || {
    _id: '',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    rating: 8.8,
    duration: 166,
    language: 'English',
    genre: ['Sci-Fi', 'Adventure'],
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
  };

  const nowShowing = movies.filter((m) => m.status === 'now_showing');
  const upcoming = movies.filter((m) => m.status === 'upcoming');
  const popular = movies.filter((m) => m.status === 'popular');

  return (
    <div className="min-h-screen pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden">
        {/* Background Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={featuredMovie.backdrop}
            alt={featuredMovie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.4] scale-105 transform animate-subtle-zoom"
          />
          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark via-cinema-dark/80 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-5">
            
            {/* Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cinema-accent/20 border border-cinema-accent/40 text-cinema-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Blockbuster of the Week</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {featuredMovie.title}
            </h1>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-1 text-amber-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{featuredMovie.rating?.toFixed(1) || '8.8'} IMDb</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-cinema-border/50">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{featuredMovie.duration} mins</span>
              </div>
              <span className="bg-slate-900/60 px-2.5 py-1 rounded-lg border border-cinema-border/50">
                {featuredMovie.language}
              </span>
              <span className="bg-slate-900/60 px-2.5 py-1 rounded-lg border border-cinema-border/50 text-cinema-accent font-semibold">
                {featuredMovie.genre?.join(' • ')}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed line-clamp-3">
              {featuredMovie.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={`/booking/${featuredMovie._id}`}
                className="px-7 py-3.5 rounded-2xl bg-cinema-accent hover:bg-cinema-accentHover text-white font-bold text-sm flex items-center space-x-2 shadow-glow-red hover:scale-105 transition-transform"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Tickets Now</span>
              </Link>

              <button
                onClick={() => handleWatchTrailer(featuredMovie)}
                className="px-6 py-3.5 rounded-2xl bg-cinema-card/90 hover:bg-slate-800 border border-cinema-border text-white font-semibold text-sm flex items-center space-x-2 backdrop-blur-md transition hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            </div>

          </div>

          {/* Quick Search Bar inside Hero */}
          <div className="mt-12 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search movies by title, director, or actor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-cinema-border text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cinema-accent shadow-2xl backdrop-blur-md"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-cinema-accent text-white text-xs font-bold hover:bg-cinema-accentHover transition"
              >
                Search
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 2. Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-8">
        
        {/* Currently Showing Movies */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-cinema-accent text-xs font-bold uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-cinema-accent animate-ping"></span>
                <span>In Theaters Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Currently Showing Movies</h2>
            </div>
            <Link
              to="/movies?status=now_showing"
              className="text-xs sm:text-sm font-semibold text-cinema-accent hover:text-white flex items-center space-x-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[2/3] bg-cinema-card animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nowShowing.slice(0, 4).map((movie) => (
                <MovieCard key={movie._id} movie={movie} onWatchTrailer={handleWatchTrailer} />
              ))}
            </div>
          )}
        </section>

        {/* Feature Highlights Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-cinema-card to-slate-900 border border-cinema-border p-8 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-cinema-accent/20 border border-cinema-accent/40 flex items-center justify-center shrink-0 text-cinema-accent shadow-glow-red">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">IMAX & 4DX Motion</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Experience movies with crystal-clear laser projection, spatial Dolby Atmos sound, and synchronised motion seating.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Instant Digital Tickets</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No paper printing required. Fast seat locking and instant contactless QR code admission right on your mobile.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Guaranteed Seat Locks</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time seat locking mechanism ensures zero duplicate bookings and full refund eligibility on cancellations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Movies */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Top Rated by Critics & Viewers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Popular Blockbusters</h2>
            </div>
            <Link
              to="/movies?status=popular"
              className="text-xs sm:text-sm font-semibold text-cinema-accent hover:text-white flex items-center space-x-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popular.slice(0, 4).map((movie) => (
              <MovieCard key={movie._id} movie={movie} onWatchTrailer={handleWatchTrailer} />
            ))}
          </div>
        </section>

        {/* Upcoming Movies */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Coming Soon</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Upcoming Releases</h2>
            </div>
            <Link
              to="/movies?status=upcoming"
              className="text-xs sm:text-sm font-semibold text-cinema-accent hover:text-white flex items-center space-x-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {upcoming.slice(0, 4).map((movie) => (
              <MovieCard key={movie._id} movie={movie} onWatchTrailer={handleWatchTrailer} />
            ))}
          </div>
        </section>

      </div>

      {/* Trailer Modal */}
      <TrailerModal
        movie={trailerMovie}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />

    </div>
  );
};

export default Home;

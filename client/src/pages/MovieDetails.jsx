import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Star, Clock, Calendar, Film, MapPin, User, ChevronRight, Ticket, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import TrailerModal from '../components/TrailerModal';
import { useBooking } from '../context/BookingContext';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBookingMovie, setBookingCinema, setBookingShow } = useBooking();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Group shows by cinema
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data.data.movie);
        const fetchedShows = res.data.data.shows || [];
        setShows(fetchedShows);

        if (fetchedShows.length > 0) {
          setSelectedDate(fetchedShows[0].showDate);
        }
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <Link to="/movies" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-cinema-accent text-white text-sm font-semibold">
          Browse Movies
        </Link>
      </div>
    );
  }

  // Extract unique show dates
  const uniqueDates = Array.from(new Set(shows.map((s) => s.showDate))).sort();

  // Filter shows by selected date
  const filteredShows = shows.filter((s) => s.showDate === selectedDate);

  // Group by cinema
  const showsByCinema = filteredShows.reduce((acc, show) => {
    const cId = show.cinemaId?._id || 'general';
    if (!acc[cId]) {
      acc[cId] = {
        cinema: show.cinemaId,
        shows: [],
      };
    }
    acc[cId].shows.push(show);
    return acc;
  }, {});

  const handleSelectShow = (show) => {
    setBookingMovie(movie);
    setBookingCinema(show.cinemaId);
    setBookingShow(show);
    navigate(`/booking/${movie._id}?showId=${show._id}`);
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* 1. Backdrop Banner */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/60 to-transparent"></div>

        {/* Back navigation */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cinema-border text-slate-300 hover:text-white backdrop-blur-md text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* 2. Movie Info Header (Floating Poster & Details) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Poster */}
          <div className="w-52 sm:w-64 shrink-0 rounded-3xl overflow-hidden border-2 border-cinema-border shadow-2xl bg-slate-900 mx-auto md:mx-0">
            <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* Details Content */}
          <div className="flex-grow space-y-4 text-center md:text-left">
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-cinema-accent/20 border border-cinema-accent/40 text-cinema-accent font-bold text-xs uppercase tracking-wider">
                {movie.status === 'upcoming' ? 'Coming Soon' : 'Now Showing'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold text-xs">
                {movie.language}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            {/* Ratings, Duration, Release Date */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{movie.rating?.toFixed(1) || '8.5'} / 10 IMDb</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300 bg-slate-900/70 px-3 py-1 rounded-xl border border-cinema-border">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{movie.duration} Minutes</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300 bg-slate-900/70 px-3 py-1 rounded-xl border border-cinema-border">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {movie.genre?.map((g) => (
                <span key={g} className="px-3 py-1 rounded-lg bg-cinema-card border border-cinema-border text-slate-300 text-xs font-medium">
                  {g}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              {movie.status !== 'upcoming' && (
                <a
                  href="#showtimes-section"
                  className="px-6 py-3 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white font-bold text-sm flex items-center space-x-2 shadow-glow-red transition transform hover:scale-105"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Select Showtime & Book</span>
                </a>
              )}

              {movie.trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="px-5 py-3 rounded-xl bg-cinema-card hover:bg-slate-800 border border-cinema-border text-white font-semibold text-sm flex items-center space-x-2 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* 3. Storyline & Cast Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pt-8 border-t border-cinema-border/50">
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Storyline</h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                {movie.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Production Crew</h4>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-slate-400">Director:</span>
                <span className="text-white font-semibold">{movie.director}</span>
              </div>
            </div>
          </div>

          {/* Cast Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Cast Members</h3>
            <div className="space-y-2.5">
              {movie.cast?.map((actor, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-cinema-card border border-cinema-border">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                    {actor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{actor}</p>
                    <p className="text-[11px] text-slate-400">Actor</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. Cinemas and Showtimes Section */}
        {movie.status !== 'upcoming' && (
          <div id="showtimes-section" className="mt-16 pt-10 border-t border-cinema-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Available Cinemas & Showtimes</h3>
                <p className="text-xs text-slate-400 mt-1">Select a screening date and click any showtime to begin seat selection.</p>
              </div>

              {/* Date Selector Tabs */}
              {uniqueDates.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {uniqueDates.map((dateStr) => {
                    const d = new Date(dateStr);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = d.getDate();
                    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center px-4 py-2 rounded-2xl border transition shrink-0 ${
                          isSelected
                            ? 'bg-cinema-accent border-cinema-accent text-white shadow-glow-red'
                            : 'bg-cinema-card border-cinema-border text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold">{dayName}</span>
                        <span className="text-base font-black">{dayNum}</span>
                        <span className="text-[10px] uppercase">{monthName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cinemas List with Showtimes */}
            {Object.keys(showsByCinema).length > 0 ? (
              <div className="space-y-4">
                {Object.values(showsByCinema).map(({ cinema, shows: cinemaShows }) => (
                  <div
                    key={cinema._id}
                    className="p-6 rounded-2xl bg-cinema-card border border-cinema-border/80 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-cinema-border/50 mb-4">
                      <div className="flex items-start space-x-2.5">
                        <MapPin className="w-5 h-5 text-cinema-accent shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-white text-base">{cinema.name}</h4>
                          <p className="text-xs text-slate-400">{cinema.address} • {cinema.location}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full w-fit">
                        M-Ticket & Contactless Entry Available
                      </span>
                    </div>

                    {/* Showtime Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      {cinemaShows.map((show) => (
                        <button
                          key={show._id}
                          onClick={() => handleSelectShow(show)}
                          className="group relative flex flex-col items-center px-4 py-2.5 rounded-xl bg-slate-900 border border-cinema-border hover:border-cinema-accent hover:bg-slate-800 transition"
                        >
                          <span className="text-sm font-bold text-white group-hover:text-cinema-accent transition">
                            {show.showTime}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            ₹{show.ticketPrice} • {show.screenName}
                          </span>
                        </button>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-cinema-card rounded-2xl border border-cinema-border">
                <p className="text-sm text-slate-400">No scheduled shows found for the selected date.</p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Trailer Modal */}
      <TrailerModal
        movie={movie}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />

    </div>
  );
};

export default MovieDetails;

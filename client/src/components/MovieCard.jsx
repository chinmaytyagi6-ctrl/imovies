import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Info, Play } from 'lucide-react';

const MovieCard = ({ movie, onWatchTrailer }) => {
  return (
    <div className="group relative bg-cinema-card rounded-2xl overflow-hidden border border-cinema-border/70 hover:border-cinema-accent/60 shadow-lg hover:shadow-glow-red transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5">
      
      {/* Poster Image & Badges */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full flex items-center shadow">
          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1 text-amber-400" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {movie.status === 'upcoming' ? (
            <span className="bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Upcoming
            </span>
          ) : (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              In Cinemas
            </span>
          )}
        </div>

        {/* Play Trailer Floating Button */}
        {movie.trailerUrl && (
          <button
            onClick={() => onWatchTrailer && onWatchTrailer(movie)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-cinema-accent/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-glow-red hover:bg-cinema-accent"
            title="Watch Trailer"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Genre & Duration */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="truncate max-w-[140px] text-slate-300 font-medium">
              {movie.genre && movie.genre.slice(0, 2).join(', ')}
            </span>
            <div className="flex items-center space-x-1 shrink-0 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{movie.duration}m</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/movies/${movie._id}`}>
            <h3 className="text-base font-bold text-white group-hover:text-cinema-accent transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          {/* Language & Director */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            <span className="text-slate-300 font-medium">{movie.language}</span> • Dir. {movie.director}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-2">
          <Link
            to={`/movies/${movie._id}`}
            className="flex-1 py-2 px-2.5 rounded-xl bg-cinema-cardLight hover:bg-slate-700/70 border border-cinema-border text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>

          {movie.status !== 'upcoming' ? (
            <Link
              to={`/booking/${movie._id}`}
              className="flex-1 py-2 px-2.5 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-glow-red transition"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book</span>
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold flex items-center justify-center cursor-not-allowed"
            >
              Notify Me
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default MovieCard;

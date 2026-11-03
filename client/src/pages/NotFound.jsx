import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-cinema-card border border-cinema-border flex items-center justify-center text-cinema-accent shadow-glow-red mb-4">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-white">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Scene Not Found</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The movie or page you are looking for has been moved or doesn't exist in our reels.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2.5 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white text-xs font-bold flex items-center space-x-2 transition"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;

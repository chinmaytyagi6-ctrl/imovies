import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ movie, isOpen, onClose }) => {
  if (!isOpen || !movie) return null;

  // Extract YouTube ID if valid
  let videoSrc = movie.trailerUrl;
  if (videoSrc && videoSrc.includes('youtube.com/watch?v=')) {
    const videoId = videoSrc.split('v=')[1]?.split('&')[0];
    videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (videoSrc && videoSrc.includes('youtu.be/')) {
    const videoId = videoSrc.split('youtu.be/')[1]?.split('?')[0];
    videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-cinema-card rounded-2xl overflow-hidden border border-cinema-border shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cinema-border bg-cinema-cardLight">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cinema-accent animate-pulse"></span>
            <h3 className="font-bold text-white text-base">
              {movie.title} – Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Embed */}
        <div className="relative aspect-video bg-black">
          {videoSrc ? (
            <iframe
              src={videoSrc}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              Trailer video preview not available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrailerModal;

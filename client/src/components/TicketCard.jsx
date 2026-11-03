import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Film, Calendar, Clock, MapPin, Printer, Download, CheckCircle, Shield } from 'lucide-react';

const TicketCard = ({ booking, onCancel }) => {
  const ticketRef = useRef();

  if (!booking) return null;

  const movie = booking.movieId || {};
  const cinema = booking.cinemaId || {};
  const show = booking.showId || {};

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking.bookingStatus === 'confirmed';

  return (
    <div className="w-full max-w-xl mx-auto my-6" ref={ticketRef}>
      {/* Ticket Container */}
      <div className="relative bg-gradient-to-br from-slate-900 via-cinema-card to-slate-950 border-2 border-cinema-border rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-cinema-accent via-red-600 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5" />
            <span className="font-extrabold tracking-wider text-sm uppercase">IMovies Digital Ticket</span>
          </div>
          <span className="text-xs font-mono font-bold tracking-widest bg-black/40 px-2.5 py-1 rounded-md">
            {booking.bookingId}
          </span>
        </div>

        {/* Ticket Body */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            
            {/* Movie Poster Thumbnail */}
            {movie.poster && (
              <div className="w-24 sm:w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-cinema-border bg-slate-950">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Details */}
            <div className="flex-grow space-y-3">
              <div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                  isConfirmed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-red-950 text-red-400 border border-red-500/40'
                }`}>
                  {booking.bookingStatus}
                </span>
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {movie.title || 'Movie Title'}
                </h3>
                <p className="text-xs text-slate-400">
                  {movie.language} • {movie.duration}m • {movie.genre?.join(', ')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-cinema-border/50">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-cinema-accent" />
                  <span>{show.showDate || 'Date'}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cinema-accent" />
                  <span>{show.showTime || 'Time'}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-cinema-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">{cinema.name}</span>
                  <p className="text-[11px] text-slate-400">{show.screenName || 'Audi 1'} • {cinema.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative my-6 border-b-2 border-dashed border-cinema-border">
            <div className="ticket-tear-left"></div>
            <div className="ticket-tear-right"></div>
          </div>

          {/* Ticket Bottom Section: Seats & QR Code */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
            <div className="space-y-2 text-center sm:text-left">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Reserved Seats</span>
                <div className="flex flex-wrap gap-1.5 mt-1 justify-center sm:justify-start">
                  {booking.selectedSeats?.map((seat) => (
                    <span
                      key={seat}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/30 border border-blue-500 text-blue-300 font-bold text-xs"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Paid</span>
                <p className="text-lg font-black text-emerald-400">₹{booking.totalAmount}</p>
                <span className="text-[10px] text-slate-500">{booking.paymentMethod}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-inner">
              <QRCodeSVG
                value={booking.qrCodeData || booking.bookingId}
                size={110}
                level="M"
                includeMargin={false}
              />
              <span className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                SCAN AT GATE
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Actions Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-cinema-border/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cinema-accent" />
            <span>Valid with Government Photo ID</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-lg bg-cinema-cardLight hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {isConfirmed && onCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                className="py-1.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-semibold transition"
              >
                Cancel Ticket
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketCard;

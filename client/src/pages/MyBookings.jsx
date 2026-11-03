import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, Printer, AlertCircle, Film, ArrowRight, Eye, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [activeTicket, setActiveTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-bookings');
      return;
    }
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    setErrorMsg('');
    setMsg('');

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setMsg('Booking cancelled successfully and seats released.');
      if (activeTicket?._id === bookingId) {
        setActiveTicket(null);
      }
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking', err);
      setErrorMsg(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && b.showId && b.showId.showDate >= todayStr
  );

  const pastOrCancelledBookings = bookings.filter(
    (b) => b.bookingStatus === 'cancelled' || (b.showId && b.showId.showDate < todayStr)
  );

  const displayedBookings =
    activeTab === 'upcoming'
      ? upcomingBookings
      : activeTab === 'past'
      ? pastOrCancelledBookings
      : bookings;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">My Movie Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your digital tickets, showtimes, and booking history.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-2xl bg-cinema-card p-1.5 border border-cinema-border">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'upcoming' ? 'bg-cinema-accent text-white shadow-glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'past' ? 'bg-cinema-accent text-white shadow-glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            Past & Cancelled ({pastOrCancelledBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-cinema-accent text-white shadow-glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 mb-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-sm">
          {msg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Bookings List */}
      {displayedBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedBookings.map((b) => {
            const movie = b.movieId || {};
            const cinema = b.cinemaId || {};
            const show = b.showId || {};
            const isConfirmed = b.bookingStatus === 'confirmed';

            return (
              <div
                key={b._id}
                className="p-5 rounded-3xl bg-cinema-card border border-cinema-border/80 hover:border-slate-500 transition shadow-xl flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  {/* Poster Thumbnail */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl bg-slate-900 border border-cinema-border shrink-0"
                  />

                  {/* Booking Details */}
                  <div className="flex-grow space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {b.bookingId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-950 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white line-clamp-1">{movie.title}</h3>
                    <p className="text-xs text-slate-400">{cinema.name} • {show.screenName || 'Screen 1'}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-cinema-accent" />
                        <span>{show.showDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-cinema-accent" />
                        <span>{show.showTime}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400">Seats:</span>
                        <span className="font-bold text-blue-400">{b.selectedSeats?.join(', ')}</span>
                      </div>
                      <span className="font-black text-emerald-400 text-sm">₹{b.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-cinema-border/50 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setActiveTicket(b)}
                    className="px-3 py-1.5 rounded-xl bg-cinema-cardLight hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 border border-cinema-border transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-cinema-accent" />
                    <span>View Digital Ticket</span>
                  </button>

                  {isConfirmed && show.showDate >= todayStr && (
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      disabled={cancellingId === b._id}
                      className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-semibold transition"
                    >
                      {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-cinema-card rounded-3xl border border-cinema-border">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any movie tickets in this category yet. Browse currently showing blockbusters to book your seats.
          </p>
          <Link
            to="/movies"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-cinema-accent text-white text-xs font-bold hover:bg-cinema-accentHover transition"
          >
            Browse Movies
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setActiveTicket(null)}
              className="absolute -top-3 -right-3 z-30 p-2 rounded-full bg-slate-900 border border-cinema-border text-slate-300 hover:text-white"
            >
              ✕
            </button>
            <TicketCard booking={activeTicket} onCancel={handleCancelBooking} />
          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;

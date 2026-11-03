import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Film,
  Users,
  Ticket,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Clock,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'cinemas' | 'shows' | 'bookings' | 'users'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Collections state
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [shows, setShows] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Add/Edit Movie Modal State
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: '',
    language: 'English',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    poster: '',
    backdrop: '',
    rating: 8.0,
    director: '',
    cast: '',
    trailerUrl: '',
    status: 'now_showing',
  });

  // Add Cinema Form State
  const [cinemaModalOpen, setCinemaModalOpen] = useState(false);
  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    location: '',
    address: '',
    screens: [
      { screenNumber: 1, name: 'Audi 1 (IMAX)', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
    ],
  });

  // Add Show Form State
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [showForm, setShowForm] = useState({
    movieId: '',
    cinemaId: '',
    screenNumber: 1,
    screenName: 'Screen 1 (Dolby Atmos)',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:00 PM',
    ticketPrice: 280,
    rows: 8,
    cols: 8,
  });

  // Guard: Admin Check
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load Overview Metrics
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, cinemasRes, showsRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/movies'),
        api.get('/cinemas'),
        api.get('/shows'),
        api.get('/admin/bookings'),
        api.get('/admin/users'),
      ]);

      setStats(statsRes.data.data);
      setMovies(moviesRes.data.data || []);
      setCinemas(cinemasRes.data.data || []);
      setShows(showsRes.data.data || []);
      setAllBookings(bookingsRes.data.data || []);
      setAllUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setErrorMsg('Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // Handle Movie Create or Update
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingMovieId) {
        await api.put(`/movies/${editingMovieId}`, movieForm);
        setSuccessMsg('Movie updated successfully!');
      } else {
        await api.post('/movies', movieForm);
        setSuccessMsg('Movie created successfully!');
      }
      setMovieModalOpen(false);
      setEditingMovieId(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Movie save error', err);
      setErrorMsg(err.response?.data?.message || 'Error saving movie.');
    }
  };

  const handleEditMovieClick = (m) => {
    setEditingMovieId(m._id);
    setMovieForm({
      title: m.title,
      description: m.description,
      genre: m.genre.join(', '),
      language: m.language,
      duration: m.duration,
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : '',
      poster: m.poster,
      backdrop: m.backdrop,
      rating: m.rating,
      director: m.director,
      cast: m.cast.join(', '),
      trailerUrl: m.trailerUrl || '',
      status: m.status,
    });
    setMovieModalOpen(true);
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie and all its associated shows?')) return;
    try {
      await api.delete(`/movies/${id}`);
      setSuccessMsg('Movie deleted successfully!');
      fetchDashboardData();
    } catch (err) {
      setErrorMsg('Failed to delete movie.');
    }
  };

  // Handle Cinema Create
  const handleSaveCinema = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cinemas', cinemaForm);
      setSuccessMsg('Cinema created successfully!');
      setCinemaModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setErrorMsg('Failed to create cinema.');
    }
  };

  // Handle Show Create
  const handleSaveShow = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shows', showForm);
      setSuccessMsg('Show scheduled successfully!');
      setShowModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule show.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      setSuccessMsg('Show deleted successfully!');
      fetchDashboardData();
    } catch (err) {
      setErrorMsg('Failed to delete show.');
    }
  };

  // Toggle User Role
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccessMsg(`User role updated to ${newRole}`);
      fetchDashboardData();
    } catch (err) {
      setErrorMsg('Failed to update user role.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-cinema-accent" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-3xl font-black text-white">IMovies Cinema Management</h1>
        </div>

        {/* Global Admin Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingMovieId(null);
              setMovieForm({
                title: '',
                description: '',
                genre: 'Action, Sci-Fi',
                language: 'English',
                duration: 130,
                releaseDate: new Date().toISOString().split('T')[0],
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
                backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
                rating: 8.2,
                director: '',
                cast: '',
                trailerUrl: '',
                status: 'now_showing',
              });
              setMovieModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white text-xs font-bold flex items-center space-x-1.5 shadow-glow-red transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>

          <button
            onClick={() => {
              if (movies.length > 0) setShowForm({ ...showForm, movieId: movies[0]._id });
              if (cinemas.length > 0) setShowForm({ ...showForm, cinemaId: cinemas[0]._id });
              setShowModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cinema-cardLight hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-cinema-border transition"
          >
            <Clock className="w-4 h-4 text-cinema-accent" />
            <span>Schedule Showtime</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-cinema-border/60 pb-4 mb-8">
        {[
          { id: 'overview', label: 'Overview & Stats', icon: TrendingUp },
          { id: 'movies', label: `Movies (${movies.length})`, icon: Film },
          { id: 'shows', label: `Showtimes (${shows.length})`, icon: Clock },
          { id: 'cinemas', label: `Cinemas (${cinemas.length})`, icon: MapPin },
          { id: 'bookings', label: `Bookings (${allBookings.length})`, icon: Ticket },
          { id: 'users', label: `Registered Users (${allUsers.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-cinema-accent text-white shadow-glow-red'
                  : 'bg-cinema-card border border-cinema-border text-slate-400 hover:text-white hover:bg-cinema-cardLight'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border flex items-center justify-between shadow-xl">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1">₹{stats.totalRevenue?.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-500">From confirmed tickets</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border flex items-center justify-between shadow-xl">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.totalBookings}</h3>
                <span className="text-[10px] text-slate-500">{stats.confirmedCount} active, {stats.cancelledCount} cancelled</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border flex items-center justify-between shadow-xl">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Movies</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.totalMovies}</h3>
                <span className="text-[10px] text-slate-500">Across all genres & statuses</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-cinema-accent flex items-center justify-center">
                <Film className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border flex items-center justify-between shadow-xl">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Users</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.totalUsers}</h3>
                <span className="text-[10px] text-slate-500">Active customer accounts</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Recent Bookings Table */}
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Customer Bookings</h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-semibold text-cinema-accent hover:underline flex items-center"
              >
                <span>View All Bookings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cinema-border/60 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Movie</th>
                    <th className="pb-3">Cinema</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinema-border/30">
                  {stats.recentBookings?.map((b) => (
                    <tr key={b._id} className="hover:bg-cinema-cardLight/50">
                      <td className="py-3 font-mono font-bold text-slate-200">{b.bookingId}</td>
                      <td className="py-3 text-slate-300">{b.userId?.name || 'Customer'}</td>
                      <td className="py-3 font-semibold text-white">{b.movieId?.title}</td>
                      <td className="py-3 text-slate-400">{b.cinemaId?.name}</td>
                      <td className="py-3 font-bold text-blue-400">{b.selectedSeats?.join(', ')}</td>
                      <td className="py-3 font-black text-emerald-400">₹{b.totalAmount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'confirmed' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MOVIES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'movies' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">All Movies Catalogue</h3>
            <span className="text-xs text-slate-400">{movies.length} titles in database</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-2xl bg-cinema-card border border-cinema-border flex space-x-4 shadow-lg hover:border-slate-500 transition"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-20 aspect-[2/3] object-cover rounded-xl bg-slate-900 shrink-0 border border-cinema-border"
                />
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cinema-accent">{m.status}</span>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{m.title}</h4>
                    <p className="text-xs text-slate-400">{m.language} • {m.duration}m</p>
                    <p className="text-xs text-amber-400 font-semibold mt-1">★ {m.rating?.toFixed(1)} / 10</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-cinema-border/50">
                    <button
                      onClick={() => handleEditMovieClick(m)}
                      className="p-2 rounded-lg bg-cinema-cardLight hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(m._id)}
                      className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SHOWTIMES SCHEDULER */}
      {/* ========================================================= */}
      {activeTab === 'shows' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Scheduled Movie Shows</h3>
            <button
              onClick={() => setShowModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cinema-accent text-white text-xs font-bold"
            >
              + Add Show
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-cinema-card border border-cinema-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cinema-border bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                  <th className="p-4">Movie</th>
                  <th className="p-4">Cinema</th>
                  <th className="p-4">Screen</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Ticket Price</th>
                  <th className="p-4">Booked</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/40">
                {shows.map((s) => (
                  <tr key={s._id} className="hover:bg-cinema-cardLight/50">
                    <td className="p-4 font-bold text-white">{s.movieId?.title}</td>
                    <td className="p-4 text-slate-300">{s.cinemaId?.name}</td>
                    <td className="p-4 text-slate-400">{s.screenName}</td>
                    <td className="p-4 text-slate-200">{s.showDate}</td>
                    <td className="p-4 font-bold text-cinema-accent">{s.showTime}</td>
                    <td className="p-4 font-black text-emerald-400">₹{s.ticketPrice}</td>
                    <td className="p-4 font-semibold text-blue-400">{s.bookedSeats?.length || 0} / {s.totalSeats}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteShow(s._id)}
                        className="p-1.5 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CINEMAS */}
      {/* ========================================================= */}
      {activeTab === 'cinemas' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Cinema Multiplex Locations</h3>
            <button
              onClick={() => setCinemaModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cinema-accent text-white text-xs font-bold"
            >
              + Add Cinema
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cinemas.map((c) => (
              <div key={c._id} className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-4 shadow-xl">
                <div>
                  <h4 className="text-lg font-black text-white">{c.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{c.address} • {c.location}</p>
                </div>

                <div className="pt-3 border-t border-cinema-border/50">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Screens & Audis:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {c.screens?.map((scr, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-slate-900 border border-cinema-border text-xs text-slate-200 font-semibold">
                        {scr.name} ({scr.totalSeats} seats)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: ALL BOOKINGS */}
      {/* ========================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-white">All User Ticket Transactions</h3>

          <div className="overflow-x-auto rounded-3xl bg-cinema-card border border-cinema-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cinema-border bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Cinema & Showtime</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/30">
                {allBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-cinema-cardLight/50">
                    <td className="p-4 font-mono font-bold text-slate-200">{b.bookingId}</td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{b.userId?.name}</p>
                      <p className="text-[10px] text-slate-400">{b.userId?.email}</p>
                    </td>
                    <td className="p-4 font-bold text-white">{b.movieId?.title}</td>
                    <td className="p-4 text-slate-300">
                      {b.cinemaId?.name}
                      <span className="block text-[10px] text-slate-400">{b.showId?.showDate} • {b.showId?.showTime}</span>
                    </td>
                    <td className="p-4 font-bold text-blue-400">{b.selectedSeats?.join(', ')}</td>
                    <td className="p-4 font-black text-emerald-400">₹{b.totalAmount}</td>
                    <td className="p-4 text-slate-400">{b.paymentMethod}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.bookingStatus === 'confirmed' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: USERS */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-white">System Users & Roles</h3>

          <div className="overflow-x-auto rounded-3xl bg-cinema-card border border-cinema-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cinema-border bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/30">
                {allUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-cinema-cardLight/50">
                    <td className="p-4 font-semibold text-white">{u.name}</td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4 text-slate-400">{u.phone}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleUserRole(u._id, u.role)}
                        className="text-xs font-semibold text-cinema-accent hover:underline"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MOVIE */}
      {/* ========================================================= */}
      {movieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-cinema-card rounded-3xl border border-cinema-border p-6 shadow-2xl my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingMovieId ? 'Edit Movie Details' : 'Add New Movie'}
            </h3>

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Director</label>
                  <input
                    type="text"
                    required
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="Action, Sci-Fi"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Language</label>
                  <input
                    type="text"
                    required
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Status</label>
                  <select
                    value={movieForm.status}
                    onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="popular">Popular</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">IMDb Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Release Date</label>
                  <input
                    type="date"
                    required
                    value={movieForm.releaseDate}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={movieForm.backdrop}
                    onChange={(e) => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cast Members (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="Actor One, Actor Two"
                  value={movieForm.cast}
                  onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Trailer Video URL (YouTube)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setMovieModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white text-xs font-bold shadow-glow-red"
                >
                  {editingMovieId ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SCHEDULE SHOWTIME */}
      {/* ========================================================= */}
      {showModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-cinema-card rounded-3xl border border-cinema-border p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Schedule a New Showtime</h3>

            <form onSubmit={handleSaveShow} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Movie</label>
                <select
                  required
                  value={showForm.movieId}
                  onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Select Cinema Multiplex</label>
                <select
                  required
                  value={showForm.cinemaId}
                  onChange={(e) => setShowForm({ ...showForm, cinemaId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                >
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.location})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Screen Name</label>
                  <input
                    type="text"
                    required
                    value={showForm.screenName}
                    onChange={(e) => setShowForm({ ...showForm, screenName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={showForm.ticketPrice}
                    onChange={(e) => setShowForm({ ...showForm, ticketPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Show Date</label>
                  <input
                    type="date"
                    required
                    value={showForm.showDate}
                    onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Show Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:30 PM"
                    value={showForm.showTime}
                    onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cinema-accent text-white text-xs font-bold shadow-glow-red"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, User, Ticket, Shield, LogOut, Menu, X, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-cinema-dark/95 backdrop-blur-md border-b border-cinema-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cinema-accent via-red-600 to-amber-500 flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform duration-300">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                I<span className="text-cinema-accent">MOVIES</span>
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 font-semibold uppercase -mt-1">
                Cinemas & IMAX
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium tracking-wide transition-colors ${
                isActive('/') ? 'text-cinema-accent font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`text-sm font-medium tracking-wide transition-colors ${
                isActive('/movies') ? 'text-cinema-accent font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Explore Movies
            </Link>
            <Link
              to="/movies?status=now_showing"
              className={`text-sm font-medium tracking-wide transition-colors ${
                location.search.includes('now_showing') ? 'text-cinema-accent font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Now Showing
            </Link>
            <Link
              to="/movies?status=upcoming"
              className={`text-sm font-medium tracking-wide transition-colors ${
                location.search.includes('upcoming') ? 'text-cinema-accent font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Upcoming
            </Link>

            {user && (
              <Link
                to="/my-bookings"
                className={`text-sm font-medium tracking-wide flex items-center space-x-1.5 transition-colors ${
                  isActive('/my-bookings') ? 'text-cinema-accent font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4 text-cinema-accent" />
                <span>My Bookings</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 flex items-center space-x-1 hover:bg-red-900/60 transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center space-x-5">
            <Link
              to="/movies"
              aria-label="Search Movies"
              className="p-2 text-slate-400 hover:text-white hover:bg-cinema-card rounded-lg transition"
            >
              <Search className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-full bg-cinema-card border border-cinema-border hover:border-slate-500 transition focus:outline-none"
                >
                  <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cinema-accent to-amber-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 rounded-2xl bg-cinema-card border border-cinema-border shadow-2xl py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-cinema-border/50">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize">
                        {user.role} Account
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-cinema-cardLight transition"
                    >
                      <User className="w-4 h-4 mr-3 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-cinema-cardLight transition"
                    >
                      <Ticket className="w-4 h-4 mr-3 text-slate-400" />
                      My Movie Tickets
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-cinema-cardLight transition"
                      >
                        <Shield className="w-4 h-4 mr-3 text-red-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-cinema-border/50 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-slate-300 hover:text-cinema-accent hover:bg-cinema-cardLight transition text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white shadow-glow-red transition transform hover:scale-[1.02]"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-cinema-card focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cinema-card border-b border-cinema-border px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 py-2"
          >
            Home
          </Link>
          <Link
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 py-2"
          >
            All Movies
          </Link>
          <Link
            to="/movies?status=now_showing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 py-2"
          >
            Currently Showing
          </Link>
          <Link
            to="/movies?status=upcoming"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 py-2"
          >
            Upcoming Releases
          </Link>

          {user ? (
            <div className="pt-3 border-t border-cinema-border space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-200 py-1"
              >
                Profile ({user.name})
              </Link>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-200 py-1"
              >
                My Bookings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-red-400 py-1"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block text-base font-medium text-cinema-accent py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-cinema-border flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-cinema-border text-slate-200 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-cinema-accent text-white text-sm font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Mail, Phone, MapPin, Twitter, Instagram, Youtube, Facebook, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-cinema-border/40 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cinema-accent to-amber-500 flex items-center justify-center text-white shadow-glow-red">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                I<span className="text-cinema-accent">MOVIES</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Experience movie magic at its best. Book tickets effortlessly for the latest blockbusters, IMAX releases, and 4DX immersive experiences across premier cinema halls.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#twitter" aria-label="Twitter" className="w-9 h-9 rounded-full bg-cinema-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-cinema-accent transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#instagram" aria-label="Instagram" className="w-9 h-9 rounded-full bg-cinema-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-cinema-accent transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#youtube" aria-label="YouTube" className="w-9 h-9 rounded-full bg-cinema-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-cinema-accent transition">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#facebook" aria-label="Facebook" className="w-9 h-9 rounded-full bg-cinema-card flex items-center justify-center text-slate-400 hover:text-white hover:bg-cinema-accent transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Movies Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Movies</h4>
            <ul className="space-y-2">
              <li><Link to="/movies?status=now_showing" className="hover:text-cinema-accent transition">Now Showing</Link></li>
              <li><Link to="/movies?status=upcoming" className="hover:text-cinema-accent transition">Upcoming Releases</Link></li>
              <li><Link to="/movies?status=popular" className="hover:text-cinema-accent transition">Popular Blockbusters</Link></li>
              <li><Link to="/movies" className="hover:text-cinema-accent transition">Browse All Genres</Link></li>
            </ul>
          </div>

          {/* Cinemas & Experiences */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Cinemas & Tech</h4>
            <ul className="space-y-2">
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-cinema-accent mr-2"></span>IMAX Laser 3D</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>Dolby Atmos 7.1</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>4DX Motion Seats</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>Gold Class Recliners</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Help & Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cinema-accent shrink-0" />
                <span>+91 (022) 800-466-8437</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cinema-accent shrink-0" />
                <span>support@imovies.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-cinema-accent shrink-0 mt-0.5" />
                <span>Metro Cinema Towers, Mumbai & Delhi, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-cinema-border/30 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} IMovies Cinema Network. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#security" className="hover:text-slate-400 transition flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              100% Secure Checkout
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

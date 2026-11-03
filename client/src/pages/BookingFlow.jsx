import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Film,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import SeatGrid from '../components/SeatGrid';
import TicketCard from '../components/TicketCard';

const BookingFlow = () => {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const showIdFromUrl = searchParams.get('showId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bookingMovie,
    setBookingMovie,
    bookingCinema,
    setBookingCinema,
    bookingShow,
    setBookingShow,
    selectedSeats,
    setSelectedSeats,
    toggleSeat,
    clearBooking,
  } = useBooking();

  // Booking steps: 1: Show Selection, 2: Seat Selection, 3: Checkout, 4: Confirmed
  const [step, setStep] = useState(1);

  // Data states
  const [movie, setMovie] = useState(bookingMovie || null);
  const [allShows, setAllShows] = useState([]);
  const [availableCinemas, setAvailableCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentShow, setCurrentShow] = useState(bookingShow || null);

  // Seat status states
  const [seatData, setSeatData] = useState({
    rows: 8,
    cols: 8,
    bookedSeats: [],
    lockedSeats: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockExpiresAt, setLockExpiresAt] = useState(null);

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');

  // Completed booking
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Fetch Movie & its Shows
  useEffect(() => {
    const fetchMovieAndShows = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/movies/${movieId}`);
        const m = res.data.data.movie;
        const sList = res.data.data.shows || [];
        setMovie(m);
        setBookingMovie(m);
        setAllShows(sList);

        // Extract distinct cinemas
        const cinemaMap = {};
        sList.forEach((s) => {
          if (s.cinemaId && !cinemaMap[s.cinemaId._id]) {
            cinemaMap[s.cinemaId._id] = s.cinemaId;
          }
        });
        const cArray = Object.values(cinemaMap);
        setAvailableCinemas(cArray);

        if (cArray.length > 0) {
          setSelectedCinemaId(cArray[0]._id);
        }

        // Distinct dates
        const dateSet = Array.from(new Set(sList.map((s) => s.showDate))).sort();
        if (dateSet.length > 0) {
          setSelectedDate(dateSet[0]);
        }

        // If showId is passed directly in URL, jump to seat selection
        if (showIdFromUrl) {
          const directShow = sList.find((s) => s._id === showIdFromUrl);
          if (directShow) {
            setCurrentShow(directShow);
            setBookingShow(directShow);
            setSelectedCinemaId(directShow.cinemaId._id);
            setSelectedDate(directShow.showDate);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Error fetching booking data:', err);
        setErrorMsg('Failed to initialize booking session.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [movieId, showIdFromUrl]);

  // 2. Fetch real-time seat status whenever currentShow changes or entering step 2
  useEffect(() => {
    if (!currentShow || step < 2) return;

    const fetchSeats = async () => {
      try {
        const res = await api.get(`/shows/${currentShow._id}/seats`);
        setSeatData({
          rows: res.data.data.rows || 8,
          cols: res.data.data.cols || 8,
          bookedSeats: res.data.data.bookedSeats || [],
          lockedSeats: res.data.data.lockedSeats || [],
        });
      } catch (err) {
        console.error('Error fetching seats', err);
      }
    };

    fetchSeats();
    // Poll seats every 8 seconds for real-time multiplayer updates
    const interval = setInterval(fetchSeats, 8000);
    return () => clearInterval(interval);
  }, [currentShow, step]);

  // Handle Proceed to Seat Selection from Step 1
  const handleProceedToSeats = (show) => {
    setCurrentShow(show);
    setBookingShow(show);
    setSelectedSeats([]);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3: Lock seats and go to checkout
  const handleProceedToCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least 1 seat to proceed.');
      return;
    }

    setErrorMsg('');
    setActionLoading(true);

    try {
      // Call server seat lock endpoint
      const res = await api.post('/shows/lock-seats', {
        showId: currentShow._id,
        seatNumbers: selectedSeats,
      });

      setLockExpiresAt(new Date(res.data.data.expiresAt));
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Seat lock failed:', err);
      setErrorMsg(
        err.response?.data?.message || 'Could not lock selected seats. Please re-select.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Step 3 -> Step 4: Confirm Booking & Payment
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!user) return;

    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await api.post('/bookings', {
        showId: currentShow._id,
        selectedSeats,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit/Debit Card (Sandbox)'
            : 'UPI - ' + upiId,
      });

      const booking = res.data.data;
      setConfirmedBooking(booking);
      setStep(4);
      clearBooking();

      // Launch victory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMsg(
        err.response?.data?.message ||
          'Failed to complete booking. One of your seats may have expired or been taken.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter shows based on selected cinema and selected date in Step 1
  const stepOneShows = allShows.filter(
    (s) =>
      (!selectedCinemaId || s.cinemaId?._id === selectedCinemaId) &&
      (!selectedDate || s.showDate === selectedDate)
  );

  const distinctDates = Array.from(new Set(allShows.map((s) => s.showDate))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Stepper Progress Bar */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-cinema-accent' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? 'bg-cinema-accent text-white shadow-glow-red' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </span>
            <span className="hidden sm:inline">Showtime</span>
          </div>

          <div className={`h-1 flex-1 mx-3 rounded ${step >= 2 ? 'bg-cinema-accent' : 'bg-slate-800'}`}></div>

          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-cinema-accent' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? 'bg-cinema-accent text-white shadow-glow-red' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </span>
            <span className="hidden sm:inline">Seats</span>
          </div>

          <div className={`h-1 flex-1 mx-3 rounded ${step >= 3 ? 'bg-cinema-accent' : 'bg-slate-800'}`}></div>

          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-cinema-accent' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? 'bg-cinema-accent text-white shadow-glow-red' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </span>
            <span className="hidden sm:inline">Checkout</span>
          </div>

          <div className={`h-1 flex-1 mx-3 rounded ${step >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>

          <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              step >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              ✓
            </span>
            <span className="hidden sm:inline">Ticket</span>
          </div>

        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-sm flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: Cinema and Showtime Selection */}
      {/* ======================================================== */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          
          {/* Movie Banner Strip */}
          <div className="p-5 rounded-3xl bg-cinema-card border border-cinema-border flex items-center space-x-5 shadow-xl">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-xl shadow"
            />
            <div>
              <span className="text-[11px] font-bold text-cinema-accent uppercase tracking-wider">Select Screening</span>
              <h2 className="text-2xl font-black text-white">{movie.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {movie.language} • {movie.duration} mins • {movie.genre?.join(', ')}
              </p>
            </div>
          </div>

          {/* 1. Date Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-cinema-accent" />
              1. Choose Date
            </h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {distinctDates.map((dateStr) => {
                const d = new Date(dateStr);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = d.getDate();
                const month = d.toLocaleDateString('en-US', { month: 'short' });
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center px-5 py-3 rounded-2xl border transition shrink-0 ${
                      isSelected
                        ? 'bg-cinema-accent border-cinema-accent text-white shadow-glow-red scale-105'
                        : 'bg-cinema-card border-cinema-border text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] uppercase font-bold">{dayName}</span>
                    <span className="text-lg font-black">{dayNum}</span>
                    <span className="text-[11px] uppercase">{month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Cinema Location Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-cinema-accent" />
              2. Choose Cinema
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableCinemas.map((cinema) => {
                const isSelected = selectedCinemaId === cinema._id;
                return (
                  <button
                    key={cinema._id}
                    onClick={() => setSelectedCinemaId(cinema._id)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-cinema-cardLight border-cinema-accent shadow-glow-red'
                        : 'bg-cinema-card border-cinema-border hover:border-slate-500'
                    }`}
                  >
                    <h4 className="font-bold text-white text-sm">{cinema.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{cinema.location} • {cinema.address}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Available Showtimes */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-2 text-cinema-accent" />
              3. Choose Showtime & Proceed
            </h3>

            {stepOneShows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stepOneShows.map((show) => (
                  <button
                    key={show._id}
                    onClick={() => handleProceedToSeats(show)}
                    className="p-5 rounded-2xl bg-cinema-card border border-cinema-border hover:border-cinema-accent hover:bg-slate-800 transition flex flex-col justify-between group shadow-lg"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl font-black text-white group-hover:text-cinema-accent transition">
                        {show.showTime}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                        ₹{show.ticketPrice}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-cinema-border/50 text-left w-full">
                      <p className="text-xs font-semibold text-slate-300">{show.screenName}</p>
                      <p className="text-[11px] text-slate-400">
                        {show.totalSeats - (show.bookedSeats?.length || 0)} seats left
                      </p>
                    </div>

                    <div className="mt-4 w-full py-2 rounded-xl bg-cinema-accent/20 group-hover:bg-cinema-accent text-cinema-accent group-hover:text-white font-bold text-xs flex items-center justify-center space-x-1 transition">
                      <span>Select Seats</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-cinema-card rounded-2xl border border-cinema-border text-slate-400 text-sm">
                No shows scheduled for the selected cinema and date. Please select another date.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: Interactive Cinema Seat Selection */}
      {/* ======================================================== */}
      {step === 2 && currentShow && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          
          {/* Top Bar with Show Info & Back Button */}
          <div className="p-4 rounded-2xl bg-cinema-card border border-cinema-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Showtime</span>
            </button>

            <div className="text-center sm:text-right">
              <span className="text-xs text-slate-400">
                {currentShow.cinemaId?.name} • <span className="text-white font-semibold">{currentShow.showDate}</span> at{' '}
                <span className="text-cinema-accent font-bold">{currentShow.showTime}</span>
              </span>
            </div>
          </div>

          {/* Seat Layout System */}
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-2xl">
            <SeatGrid
              rows={seatData.rows}
              cols={seatData.cols}
              bookedSeats={seatData.bookedSeats}
              lockedSeats={seatData.lockedSeats}
              selectedSeats={selectedSeats}
              onSeatClick={toggleSeat}
              ticketPrice={currentShow.ticketPrice}
            />

            {/* Bottom Proceed Action */}
            <div className="pt-6 border-t border-cinema-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-400">Total Price ({selectedSeats.length} Tickets):</span>
                <p className="text-2xl font-black text-white">
                  ₹{selectedSeats.length * currentShow.ticketPrice}
                </p>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0 || actionLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cinema-accent hover:bg-cinema-accentHover disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-glow-red transition transform hover:scale-[1.02]"
              >
                {actionLoading ? (
                  <span>Locking Seats...</span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: Booking & Checkout Summary */}
      {/* ======================================================== */}
      {step === 3 && currentShow && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          
          <button
            onClick={() => setStep(2)}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify Seat Selection</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Booking Summary Box */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-2xl space-y-5">
              <h3 className="text-xl font-black text-white border-b border-cinema-border pb-3">
                Booking Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Movie</span>
                  <span className="font-bold text-white text-right">{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cinema</span>
                  <span className="font-semibold text-slate-200 text-right">{currentShow.cinemaId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Screen</span>
                  <span className="text-slate-200">{currentShow.screenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="text-cinema-accent font-semibold">{currentShow.showDate} • {currentShow.showTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seats</span>
                  <span className="font-bold text-blue-400">{selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tickets</span>
                  <span className="text-slate-200">{selectedSeats.length} Ticket(s) × ₹{currentShow.ticketPrice}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-cinema-border/60 flex justify-between items-center">
                <span className="text-base font-bold text-white">Total Amount</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{selectedSeats.length * currentShow.ticketPrice}
                </span>
              </div>

              {/* Temporary Seat Lock Note */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Seats are temporarily held for you. Complete payment within 5 minutes.</span>
              </div>
            </div>

            {/* Payment Gateway Box (Sandbox Demo) */}
            <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Payment Method
                </h4>

                {/* Tabs */}
                <div className="flex rounded-xl bg-slate-900 p-1 mb-4 border border-cinema-border">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      paymentMethod === 'card' ? 'bg-cinema-accent text-white' : 'text-slate-400'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      paymentMethod === 'upi' ? 'bg-cinema-accent text-white' : 'text-slate-400'
                    }`}
                  >
                    UPI
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Card Number (Sandbox)</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Exp Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Virtual Payment Address (VPA / UPI)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-cinema-border text-white text-xs"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, or BHIM.</p>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center space-x-1.5 shadow-lg transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{actionLoading ? 'Processing...' : `Pay ₹${selectedSeats.length * currentShow.ticketPrice}`}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Sandbox Test Mode • Instant Confirmation
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: Booking Confirmation with Digital Ticket */}
      {/* ======================================================== */}
      {step === 4 && confirmedBooking && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white">Booking Confirmed!</h2>
            <p className="text-sm text-slate-400">
              Your tickets are confirmed. We've generated your digital m-ticket with entrance QR code below.
            </p>
          </div>

          {/* Ticket Card Component */}
          <TicketCard booking={confirmedBooking} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/my-bookings"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cinema-cardLight hover:bg-slate-700 text-white text-sm font-semibold text-center border border-cinema-border transition"
            >
              View in My Bookings
            </Link>
            <Link
              to="/movies"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cinema-accent hover:bg-cinema-accentHover text-white text-sm font-bold text-center transition"
            >
              Browse More Movies
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};

export default BookingFlow;

import React from 'react';
import { Monitor, Check, UserCheck, Lock } from 'lucide-react';

const SeatGrid = ({
  rows = 8,
  cols = 8,
  bookedSeats = [],
  lockedSeats = [], // locked by others
  selectedSeats = [],
  onSeatClick,
  ticketPrice = 250,
}) => {
  // Row letters: A, B, C, D, E, F, G, H...
  const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));
  const colNumbers = Array.from({ length: cols }, (_, i) => i + 1);

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (lockedSeats.includes(seatId)) return 'locked';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-4">
      
      {/* Cinema Screen Projection Graphic */}
      <div className="w-full max-w-lg mb-10 flex flex-col items-center">
        <div className="w-4/5 cinema-screen mb-3"></div>
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-widest">
          <Monitor className="w-3.5 h-3.5" />
          <span>CINEMA SCREEN THIS WAY</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">Eyes on the big screen</p>
      </div>

      {/* Seat Matrix */}
      <div className="overflow-x-auto max-w-full pb-4">
        <div className="inline-block min-w-fit px-4">
          <div className="flex flex-col space-y-2.5">
            {rowLetters.map((rowLetter) => (
              <div key={rowLetter} className="flex items-center space-x-3">
                {/* Row Identifier */}
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  {rowLetter}
                </span>

                {/* Seat buttons in row */}
                <div className="flex items-center space-x-2">
                  {colNumbers.map((colNum) => {
                    const seatId = `${rowLetter}${colNum}`;
                    const status = getSeatStatus(seatId);

                    // Aisle space after 4th seat
                    const isAisle = colNum === Math.floor(cols / 2);

                    let seatClasses = '';
                    if (status === 'booked') {
                      seatClasses =
                        'bg-slate-800 text-slate-600 border border-slate-700/60 cursor-not-allowed opacity-60';
                    } else if (status === 'locked') {
                      seatClasses =
                        'bg-amber-950/60 text-amber-500 border border-amber-600/60 cursor-not-allowed animate-pulse';
                    } else if (status === 'selected') {
                      seatClasses =
                        'bg-blue-600 text-white font-bold border-2 border-blue-400 shadow-glow-blue scale-105';
                    } else {
                      // Available
                      seatClasses =
                        'bg-emerald-950/40 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-400 hover:scale-105 transition-transform';
                    }

                    return (
                      <React.Fragment key={seatId}>
                        <button
                          type="button"
                          onClick={() => {
                            if (status !== 'booked' && status !== 'locked') {
                              onSeatClick(seatId);
                            }
                          }}
                          disabled={status === 'booked' || status === 'locked'}
                          title={
                            status === 'booked'
                              ? `Seat ${seatId} (Already Booked)`
                              : status === 'locked'
                              ? `Seat ${seatId} (Reserved by another customer)`
                              : status === 'selected'
                              ? `Seat ${seatId} (Selected)`
                              : `Seat ${seatId} (Available - ₹${ticketPrice})`
                          }
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${seatClasses}`}
                        >
                          {status === 'selected' ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            seatId
                          )}
                        </button>
                        {isAisle && <div className="w-4 sm:w-6"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Identifier */}
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  {rowLetter}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 p-3 rounded-xl bg-cinema-card border border-cinema-border/60 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-emerald-950/40 border border-emerald-500/60"></div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-blue-600 border border-blue-400"></div>
          <span className="text-slate-300">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
          <span className="text-slate-500">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-amber-950/60 border border-amber-500"></div>
          <span className="text-amber-400">Locked</span>
        </div>
      </div>

      {/* Live Selection Summary Pill */}
      <div className="mt-6 w-full max-w-md p-4 rounded-2xl bg-cinema-cardLight/80 border border-cinema-border flex items-center justify-between shadow-xl">
        <div>
          <p className="text-xs text-slate-400">
            Selected Seats ({selectedSeats.length}):
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'No seats chosen yet'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Estimated Total:</p>
          <p className="text-lg font-extrabold text-cinema-accent">
            ₹{selectedSeats.length * ticketPrice}
          </p>
        </div>
      </div>

    </div>
  );
};

export default SeatGrid;

import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingMovie, setBookingMovie] = useState(null);
  const [bookingCinema, setBookingCinema] = useState(null);
  const [bookingShow, setBookingShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per booking transaction.');
          return prev;
        }
        return [...prev, seatId].sort();
      }
    });
  };

  const clearBooking = () => {
    setBookingMovie(null);
    setBookingCinema(null);
    setBookingShow(null);
    setSelectedSeats([]);
  };

  const ticketPrice = bookingShow?.ticketPrice || 0;
  const totalAmount = ticketPrice * selectedSeats.length;

  return (
    <BookingContext.Provider
      value={{
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
        ticketPrice,
        totalAmount,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

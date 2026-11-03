const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: 'English',
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    rating: 8.8,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    status: 'now_showing',
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral weight and devastating geopolitical consequences.',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    rating: 8.9,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    status: 'popular',
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    duration: 140,
    releaseDate: new Date('2023-06-02'),
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    rating: 8.7,
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson', 'Daniel Kaluuya'],
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    status: 'now_showing',
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'English',
    duration: 152,
    releaseDate: new Date('2008-07-18'),
    poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    rating: 9.0,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Maggie Gyllenhaal'],
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    status: 'popular',
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    language: 'English',
    duration: 169,
    releaseDate: new Date('2014-11-07'),
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    rating: 8.7,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    status: 'popular',
  },
  {
    title: 'Deadpool & Wolverine',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy in a high-stakes, multiversal cinematic showdown.',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    language: 'English',
    duration: 128,
    releaseDate: new Date('2024-07-26'),
    poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
    rating: 8.1,
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Morena Baccarin'],
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    status: 'now_showing',
  },
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    genre: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
    language: 'English',
    duration: 192,
    releaseDate: new Date('2022-12-16'),
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    rating: 7.8,
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang', 'Kate Winslet'],
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    status: 'popular',
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    genre: ['Action', 'Drama', 'Adventure'],
    language: 'English',
    duration: 148,
    releaseDate: new Date('2024-11-22'),
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1600&q=80',
    rating: 8.4,
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen', 'Joseph Quinn'],
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    status: 'upcoming',
  },
  {
    title: 'Joker: Folie à Deux',
    description: 'Failed comedian Arthur Fleck meets the love of his life, Harley Quinn, while incarcerated at Arkham State Hospital. Upon his release, the two embark on a doomed, musical romantic misadventure.',
    genre: ['Crime', 'Drama', 'Musical'],
    language: 'English',
    duration: 138,
    releaseDate: new Date('2024-10-04'),
    poster: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    rating: 7.6,
    director: 'Todd Phillips',
    cast: ['Joaquin Phoenix', 'Lady Gaga', 'Brendan Gleeson', 'Catherine Keener', 'Zazie Beetz'],
    trailerUrl: 'https://www.youtube.com/watch?v=_OKAwz2NiJs',
    status: 'upcoming',
  },
];

const sampleCinemas = [
  {
    name: 'IMovies IMAX & Luxe - Downtown Mall',
    location: 'Mumbai',
    address: 'Level 4, Downtown Mega Mall, Senapati Bapat Marg, Lower Parel',
    screens: [
      { screenNumber: 1, name: 'IMAX Laser 3D', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
      { screenNumber: 2, name: 'Dolby Atmos Gold', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
    ],
  },
  {
    name: 'IMovies 4DX & Gold Class - Cyber Hub',
    location: 'Gurugram',
    address: 'DLF Cyber City, Phase 2, Sector 24, Cyber Hub Promenade',
    screens: [
      { screenNumber: 1, name: '4DX Motion Cinema', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
      { screenNumber: 2, name: 'Dolby Surround 7.1', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
    ],
  },
  {
    name: 'IMovies Grand Cinema - Phoenix Marketcity',
    location: 'Bengaluru',
    address: 'Whitefield Main Road, Mahadevapura, Phoenix Marketcity Campus',
    screens: [
      { screenNumber: 1, name: 'PXL Giant Screen', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
      { screenNumber: 2, name: 'Atmos Premium', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
    ],
  },
  {
    name: 'IMovies PXL - Select Citywalk',
    location: 'Delhi',
    address: 'A-3, District Centre, Saket, Select Citywalk Multiplex Complex',
    screens: [
      { screenNumber: 1, name: 'PXL Laser Supreme', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
      { screenNumber: 2, name: 'Luxe Recliner Hall', totalSeats: 64, seatLayout: { rows: 8, cols: 8 } },
    ],
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // Clear existing data
    console.log('[Seed] Cleaning old records...');
    await User.deleteMany();
    await Movie.deleteMany();
    await Cinema.deleteMany();
    await Show.deleteMany();
    await Booking.deleteMany();
    await SeatLock.deleteMany();

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@imovies.com',
      phone: '+91 9876543210',
      password: 'password123',
      role: 'admin',
    });

    const testUser = await User.create({
      name: 'Alex Johnson',
      email: 'user@imovies.com',
      phone: '+91 9123456789',
      password: 'password123',
      role: 'user',
    });

    console.log(`[Seed] Created Admin: ${adminUser.email} (password: password123)`);
    console.log(`[Seed] Created Demo User: ${testUser.email} (password: password123)`);

    // 2. Insert Movies
    console.log('[Seed] Inserting 9 cinematic movies...');
    const insertedMovies = await Movie.insertMany(sampleMovies);

    // 3. Insert Cinemas
    console.log('[Seed] Inserting 4 premium cinema locations...');
    const insertedCinemas = await Cinema.insertMany(sampleCinemas);

    // 4. Generate Shows for next 6 days
    console.log('[Seed] Generating dynamic showtimes and dates...');
    const showTimes = ['10:30 AM', '02:00 PM', '05:30 PM', '09:00 PM'];
    const showDocs = [];

    // Today + next 5 days
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Schedule shows for now_showing and popular movies across cinemas
    const activeMovies = insertedMovies.filter((m) => m.status !== 'upcoming');

    for (const movie of activeMovies) {
      for (const cinema of insertedCinemas) {
        for (const date of dates) {
          // 2 shows per cinema per movie per day
          const times = [showTimes[0], showTimes[2]];
          for (let sIdx = 0; sIdx < times.length; sIdx++) {
            // Some pre-booked seats for realistic look
            const preBooked = ['A3', 'A4', 'B5', 'C2', 'D4'];
            showDocs.push({
              movieId: movie._id,
              cinemaId: cinema._id,
              screenNumber: sIdx + 1,
              screenName: cinema.screens[sIdx] ? cinema.screens[sIdx].name : 'Audi 1',
              showDate: date,
              showTime: times[sIdx],
              ticketPrice: 280 + sIdx * 50,
              totalSeats: 64,
              rows: 8,
              cols: 8,
              bookedSeats: preBooked,
            });
          }
        }
      }
    }

    const insertedShows = await Show.insertMany(showDocs);
    console.log(`[Seed] Created ${insertedShows.length} dynamic shows.`);

    // 5. Create a sample initial confirmed booking for the demo user
    console.log('[Seed] Creating demo booking...');
    const firstShow = insertedShows[0];
    const demoBookingId = 'IMV-901824-3482';
    const demoSeats = ['E3', 'E4'];
    const demoTotal = firstShow.ticketPrice * demoSeats.length;

    await Show.findByIdAndUpdate(firstShow._id, {
      $push: { bookedSeats: { $each: demoSeats } },
    });

    await Booking.create({
      bookingId: demoBookingId,
      userId: testUser._id,
      movieId: firstShow.movieId,
      cinemaId: firstShow.cinemaId,
      showId: firstShow._id,
      selectedSeats: demoSeats,
      ticketPrice: firstShow.ticketPrice,
      totalAmount: demoTotal,
      paymentStatus: 'completed',
      paymentMethod: 'Credit Card (Sandbox)',
      bookingStatus: 'confirmed',
      qrCodeData: JSON.stringify({
        bookingId: demoBookingId,
        movie: 'Dune: Part Two',
        seats: demoSeats,
        tickets: demoSeats.length,
        total: demoTotal,
      }),
    });

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();

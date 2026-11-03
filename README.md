# IMovies – Online Movie Ticket Booking System

A full-stack, responsive, and production-ready online movie ticket booking platform crafted with a modern dark cinematic theme (Netflix/IMAX style), real-time seat selection, temporary seat locking, digital QR-code tickets, user booking management, and a complete role-based admin dashboard.

---

## 🎬 Live Application Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide Icons, QR Code SVG, Canvas Confetti.
- **Backend:** Node.js, Express.js, RESTful APIs, JWT Authentication, bcrypt.js password hashing, Rate Limiting, CORS.
- **Database:** MongoDB & Mongoose ODM (Users, Movies, Cinemas, Shows, Bookings, SeatLocks with TTL auto-expiration).

---

## 🚀 Key Features

### 1. 🌌 Dark Cinematic UI & Theme
- Deep navy/black palette with vibrant red and golden amber cinema accents (`#e50914`, `#f59e0b`).
- Responsive layouts for Desktop, Tablet, and Mobile.
- Hero banner with featured blockbuster, trailer popup modal, rating badges, and quick search.
- Clean cards with backdrop images, hover elevation, and glowing neon effects.

### 2. 🔐 Full User Authentication & Profiles
- User registration and login with bcrypt password hashing and JWT authentication.
- Form validation and input verification.
- Profile dashboard displaying user's verified status, total bookings count, and ability to update details or password.
- Protected routes for authenticated customers and role-restricted routes for administrators.

### 3. 🔍 Movie Search, Filtering & Details
- Search movies by title, director, or actor names.
- Multi-dimensional filters: Genre (Action, Sci-Fi, Adventure, Drama, etc.), Language, and Release Status (Now Showing, Popular, Upcoming).
- Sorting by Latest Releases, Highest IMDb Rating, or Title (A–Z).
- Movie details page featuring high-res backdrop, storyline, duration, director, cast chips, official trailer player, and cinema showtime selectors.

### 4. 💺 Interactive Seat Selection & Real-time Locking
- True-to-life theater seat map (Rows A–H, Columns 1–8) with curved screen projection graphic.
- Clear seat states:
  - 🟢 **Available:** Green outline, clickable
  - 🔵 **Selected:** Vibrant blue with checkmark
  - ⚫ **Booked:** Slate gray/disabled
  - 🟠 **Locked:** Amber pulsing (held by another customer)
- **Temporary Seat Locking (TTL):** Prevents two users from picking the same seat simultaneously by locking chosen seats for 5 minutes.
- **Atomic Booking Operations:** Guarantees database consistency using atomic MongoDB operations (`$nin` and `$push`).

### 5. 🎟️ Digital Ticket & Contactless Entry
- Automated unique booking ID generation (`IMV-XXXXXX-XXXX`).
- Live QR Code generated using SVG for gate check-in.
- Downloadable and printable ticket card with perforated film design.
- Demo Sandbox checkout supporting Credit/Debit Card and Instant UPI.

### 6. 📜 My Bookings Dashboard
- View all previous and upcoming bookings.
- Inspect full digital ticket at any time.
- Eligible booking cancellation with automatic seat release back to the cinema pool.

### 7. 🛡️ Comprehensive Admin Dashboard
- **Analytics & KPIs:** Real-time counts of Total Users, Total Movies, Total Bookings, and Total Revenue.
- **Movie Management:** Add new movies, edit details, manage posters/backdrops, and delete movies.
- **Cinema & Screen Management:** Configure multiplex locations, addresses, and screens.
- **Showtime Scheduler:** Dynamically schedule shows with movie, cinema, screen, date, time, and ticket price.
- **Bookings Overview:** Global inspection of all user ticket transactions.
- **User Role Management:** View all accounts and toggle user/admin access privileges.

---

## 👥 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@imovies.com` | `password123` |
| **Demo Customer** | `user@imovies.com` | `password123` |

*Tip: The Sign In page includes convenient 1-click demo autofill buttons.*

---

## 📁 Project Folder Structure

```
imovies/
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── assets/             # Images & media
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Top navigation with responsive mobile drawer
│   │   │   ├── Footer.jsx      # Cinematic footer with quick links
│   │   │   ├── MovieCard.jsx   # Movie card with ratings & actions
│   │   │   ├── SeatGrid.jsx    # Interactive 8x8 theater seat grid
│   │   │   ├── TicketCard.jsx  # Digital m-ticket with QR code & print
│   │   │   └── TrailerModal.jsx# YouTube trailer player modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # JWT state & profile management
│   │   │   └── BookingContext.jsx # Seat selection & checkout state
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with hero banner & categories
│   │   │   ├── Movies.jsx      # Search, filter, and sorting catalogue
│   │   │   ├── MovieDetails.jsx# Storyline, cast, trailer & showtimes
│   │   │   ├── BookingFlow.jsx # 4-step booking process with seat map & pay
│   │   │   ├── MyBookings.jsx  # Customer ticket history & cancellations
│   │   │   ├── Profile.jsx     # User details & password change
│   │   │   ├── Login.jsx       # Sign in with 1-click demo fill
│   │   │   ├── Register.jsx    # User registration with validation
│   │   │   ├── AdminDashboard.jsx # Admin metrics & CRUD consoles
│   │   │   └── NotFound.jsx    # 404 scene not found page
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptors
│   │   ├── styles/
│   │   │   └── index.css       # Tailwind directives & cinema scrollbars
│   │   ├── App.jsx             # Router configuration & protected routes
│   │   └── main.jsx            # Application entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend Node/Express API
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   ├── movieController.js  # Movies CRUD & search filters
│   │   ├── cinemaController.js # Cinemas & screens
│   │   ├── showController.js   # Shows, seat status, seat locking
│   │   ├── bookingController.js# Atomic booking, QR code, cancellations
│   │   └── adminController.js  # Dashboard analytics & role management
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role protection
│   │   └── errorHandler.js     # Centralized error handler
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt & JWT
│   │   ├── Movie.js            # Movie schema with text indexes
│   │   ├── Cinema.js           # Cinema & screens schema
│   │   ├── Show.js             # Show schedule & booked seats
│   │   ├── Booking.js          # Booking record & QR data
│   │   └── SeatLock.js         # Seat lock with MongoDB TTL index
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── cinemaRoutes.js
│   │   ├── showRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── seed.js             # Rich seed script with 9 movies & shows
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express application entry
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Installation & Execution Instructions

### 1. Prerequisites
- **Node.js** (v18.0 or higher)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_cinematic
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Sample Database
Populate 9 rich movies, cinemas, screens, and 300+ dynamic shows:
```bash
cd server
npm run seed
```

### 4. Start Backend Server
```bash
cd server
npm run dev
```
*Backend will run at `http://localhost:5000` with API at `http://localhost:5000/api`.*

### 5. Start Frontend Client
In a new terminal:
```bash
cd client
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login & receive JWT token |
| `GET` | `/api/auth/profile` | Private | Fetch logged-in user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile / password |
| `GET` | `/api/movies` | Public | Search, filter, and sort movies |
| `GET` | `/api/movies/:id` | Public | Get movie details and upcoming shows |
| `POST` | `/api/movies` | Admin | Create a new movie |
| `PUT` | `/api/movies/:id` | Admin | Update movie details |
| `DELETE`| `/api/movies/:id` | Admin | Delete movie and associated shows |
| `GET` | `/api/cinemas` | Public | Get list of cinema complexes |
| `POST` | `/api/cinemas` | Admin | Create a new cinema location |
| `GET` | `/api/shows` | Public | List shows by movie, cinema, or date |
| `GET` | `/api/shows/:id/seats` | Public | Live seat availability & lock status |
| `POST` | `/api/shows/lock-seats`| Private | Temporarily lock selected seats (5 mins) |
| `POST` | `/api/shows/unlock-seats`| Private | Release locked seats |
| `POST` | `/api/shows` | Admin | Schedule a new show |
| `DELETE`| `/api/shows/:id` | Admin | Delete a scheduled show |
| `POST` | `/api/bookings` | Private | Atomic seat booking & QR generation |
| `GET` | `/api/bookings/my-bookings`| Private | User's active & past bookings |
| `GET` | `/api/bookings/:id` | Private | Get single booking receipt |
| `PUT` | `/api/bookings/:id/cancel`| Private | Cancel booking and release seats |
| `GET` | `/api/admin/dashboard` | Admin | Analytics, revenue, & recent orders |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `PUT` | `/api/admin/users/:id/role`| Admin | Promote or demote user role |
| `GET` | `/api/admin/bookings` | Admin | Global inspection of all bookings |

---

## 🔒 Security & Concurrency Controls
- **Rate Limiting:** Protects `/api/auth` endpoints from credential stuffing and brute-force attacks.
- **Seat Race Condition Prevention:** Server validates seat availability at multiple points:
  1. Temporary lock prevents other users from selecting identical seats.
  2. MongoDB atomic find-and-update (`bookedSeats: { $nin: selectedSeats }`) ensures that even simultaneous checkout clicks cannot double-book a single seat.
- **Role-based Access Control:** Strict middleware guards `/api/admin` routes against non-admin tokens.
- **Input Sanitization:** Regex email validation, password length checks, and typed Mongoose schemas.

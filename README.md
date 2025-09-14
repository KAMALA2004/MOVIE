# 🎬 CineReview - Movie Review Platform

A beautiful, full-featured movie review platform built with React, TypeScript, and OMDb API integration. Discover movies, read reviews, rate films, and build your personal watchlist.

![CineReview Preview](https://images.unsplash.com/photo-1489599210478-2b9ce4450fb1?w=1200&h=600&fit=crop)

## ✨ Features

### Core Functionality
- 🎭 **Movie Discovery**: Browse trending, popular, and top-rated movies
- 🔍 **Advanced Search**: Search movies with filters by genre, year, and rating
- 📝 **Review System**: Write and read movie reviews with star ratings
- ❤️ **Watchlist**: Save movies to your personal watchlist
- 🎬 **Movie Details**: Comprehensive movie information with cast, crew, and trailers
- 👤 **User Profiles**: Personal profiles with review history

### Design & UX
- 🌙 **Cinema Dark Theme**: Elegant dark theme with golden accents
- 📱 **Fully Responsive**: Beautiful on desktop, tablet, and mobile
- ⚡ **Fast Performance**: Optimized with caching and lazy loading
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations

### Technical Features
- 🔗 **OMDb Integration**: Real movie data, posters, and details from IMDb
- 🔐 **User Authentication**: Secure login and registration with JWT
- 💾 **Database Storage**: Store reviews, ratings, and watchlists with SQLite
- 🚀 **Modern Stack**: React, TypeScript, Tailwind CSS, React Query, Node.js, Express

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd movie-review-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up OMDb API** (Required for movie data)
   - Follow the [OMDb Setup Guide](./OMDB_SETUP.md)
   - Get your free API key from [OMDb](http://www.omdbapi.com/apikey.aspx)
   - Update `src/lib/omdb.ts` with your API key

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:8080`
   - Start exploring movies!

## 🗄️ Backend Setup (Required for Full Functionality)

For full functionality including user authentication, reviews, and watchlists, set up the backend:

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run migrate
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:8080` and provides:
- User authentication with JWT
- Movie reviews and ratings storage
- Personal watchlists
- User profiles

## 📊 Database Schema

The backend uses SQLite with the following tables:

### Movies Table
- `imdbID`, `Title`, `Year`, `Rated`, `Released`, `Runtime`, `Genre`, `Director`, `Writer`, `Actors`, `Plot`, `Language`, `Country`, `Awards`, `Poster`, `Metascore`, `imdbRating`, `imdbVotes`, `Type`, `DVD`, `BoxOffice`, `Production`, `Website`, `Response`, `average_rating`

### Users Table  
- `id`, `username`, `email`, `password_hash`, `is_admin`, `bio`, `profile_picture`, `join_date`

### Reviews Table
- `id`, `user_id`, `movie_id`, `rating`, `review_text`, `created_at`

### Watchlist Table
- `id`, `user_id`, `movie_id`, `status`, `added_at`

## 🎨 Design System

The app uses a carefully crafted design system with:
- **Cinema-inspired color palette**: Deep blues, purples, and golden accents
- **Semantic tokens**: Consistent colors, gradients, and animations
- **Responsive typography**: Optimized for readability across devices
- **Custom components**: Beautiful movie cards, star ratings, and more

## 🔌 API Integration

### OMDb API Features
- **Movie Search**: Find any movie in IMDb's extensive database
- **Movie Details**: Get comprehensive information including cast, crew, genres, ratings
- **High-Quality Images**: Movie posters in multiple resolutions
- **IMDb Integration**: Direct access to IMDb ratings and votes
- **Genre Filtering**: Filter movies by genre, year, rating, and more

### API Rate Limits
- 1000 requests per day (free tier)
- Built-in caching to optimize performance

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components + custom components
│   ├── navigation/     # Header and navigation components
│   └── sections/       # Page sections (hero, movie grids)
├── pages/              # Page components
│   ├── Home.tsx        # Homepage with featured movies
│   ├── Movies.tsx      # Movie browsing with filters
│   ├── MovieDetails.tsx # Individual movie details
│   └── Search.tsx      # Movie search functionality
├── lib/                # Utility functions
│   ├── omdb.ts         # OMDb API integration
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🚢 Deployment

Deploy your Movie Review Platform:

1. **Frontend**: Deploy the React app to Vercel, Netlify, or any static hosting
2. **Backend**: Deploy the Node.js/Express API to Railway, Heroku, or DigitalOcean
3. **Database**: Use the included SQLite database or migrate to PostgreSQL/MySQL

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query, React Context
- **Routing**: React Router
- **Backend**: Node.js, Express, SQLite
- **API**: OMDb (Open Movie Database)

## 📝 Usage Examples

### Browse Movies
- Visit the homepage to see trending and popular movies
- Use the movie browser to filter by genre, year, and rating
- Search for specific movies using the search functionality

### Rate and Review
- Click on any movie to view details
- Write reviews and give star ratings (requires backend)
- View reviews from other users

### Manage Watchlist
- Add movies to your personal watchlist
- View your saved movies in your profile
- Remove movies when you've watched them

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Open Movie Database (OMDb)](http://www.omdbapi.com/) for movie data and images
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide React](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ using React, TypeScript, and modern web technologies**

Ready to start your movie review platform? Get your OMDb API key and start building! 🎬
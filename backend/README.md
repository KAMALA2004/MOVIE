# FilmScape Haven Backend API

A comprehensive RESTful API for the FilmScape Haven movie review platform built with Node.js, Express, and SQLite.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Movie Management**: CRUD operations for movies with IMDb integration
- **Review System**: Users can submit, update, and delete movie reviews
- **Watchlist**: Users can add movies to their personal watchlist
- **User Profiles**: User management with profile customization
- **Admin Panel**: Administrative functions for user and movie management
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Data Validation**: Comprehensive input validation and error handling

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/verify` - Verify JWT token

### Movies
- `GET /api/movies` - Get all movies (with pagination and filtering)
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/imdb/:imdbId` - Get movie by IMDb ID
- `POST /api/movies` - Add new movie (admin only)
- `PUT /api/movies/:id` - Update movie (admin only)
- `DELETE /api/movies/:id` - Delete movie (admin only)
- `GET /api/movies/:id/reviews` - Get movie reviews

### Reviews
- `POST /api/reviews/movies/:movieId` - Submit a new review
- `PUT /api/reviews/:reviewId` - Update a review
- `DELETE /api/reviews/:reviewId` - Delete a review
- `GET /api/reviews/user/:userId` - Get user's reviews
- `GET /api/reviews` - Get recent reviews

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/password` - Change password
- `GET /api/users/:id/watchlist` - Get user's watchlist
- `POST /api/users/:id/watchlist` - Add movie to watchlist
- `DELETE /api/users/:id/watchlist/:movieId` - Remove movie from watchlist
- `PUT /api/users/:id/watchlist/:movieId` - Update watchlist item
- `GET /api/users` - Get all users (admin only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd filmscape-haven/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   DB_PATH=./database.sqlite
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Initialize the database**
   ```bash
   npm run migrate
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password_hash` (String)
- `profile_picture` (String, Optional)
- `bio` (Text, Optional)
- `is_admin` (Boolean, Default: false)
- `is_active` (Boolean, Default: true)
- `last_login` (Date, Optional)
- `created_at` (Date)
- `updated_at` (Date)

### Movies Table
- `id` (UUID, Primary Key)
- `imdb_id` (String, Unique)
- `title` (String)
- `year` (Integer)
- `rated` (String, Optional)
- `released` (String, Optional)
- `runtime` (String, Optional)
- `genre` (String, Optional)
- `director` (String, Optional)
- `writer` (Text, Optional)
- `actors` (Text, Optional)
- `plot` (Text, Optional)
- `language` (String, Optional)
- `country` (String, Optional)
- `awards` (Text, Optional)
- `poster` (String, Optional)
- `imdb_rating` (Decimal, Optional)
- `imdb_votes` (String, Optional)
- `type` (String, Default: 'movie')
- `dvd` (String, Optional)
- `box_office` (String, Optional)
- `production` (String, Optional)
- `website` (String, Optional)
- `average_rating` (Decimal, Calculated)
- `total_reviews` (Integer, Calculated)
- `created_at` (Date)
- `updated_at` (Date)

### Reviews Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `movie_id` (UUID, Foreign Key)
- `rating` (Integer, 1-10)
- `review_text` (Text, Optional)
- `is_spoiler` (Boolean, Default: false)
- `is_public` (Boolean, Default: true)
- `likes_count` (Integer, Default: 0)
- `is_helpful` (Boolean, Default: true)
- `created_at` (Date)
- `updated_at` (Date)

### Watchlist Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `movie_id` (UUID, Foreign Key)
- `status` (Enum: 'want_to_watch', 'watching', 'watched')
- `notes` (Text, Optional)
- `priority` (Integer, 0-5)
- `created_at` (Date)
- `updated_at` (Date)

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get movies with filtering
```bash
curl "http://localhost:3001/api/movies?page=1&limit=10&genre=Action&min_rating=7.0"
```

### Submit a review
```bash
curl -X POST http://localhost:3001/api/reviews/movies/movie-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "rating": 8,
    "review_text": "Great movie with excellent acting!",
    "is_spoiler": false
  }'
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": [] // Optional validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **SQL Injection Protection**: Sequelize ORM protection

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Initialize database

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_PATH` - SQLite database file path
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origin
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Rating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export interface MovieDetails extends Movie {
  // OMDb API returns all details in the main Movie interface
  // This interface is kept for compatibility
}

export interface Rating {
  Source: string;
  Value: string;
}

export interface OMDbSearchResponse {
  Search: Movie[];
  totalResults: string;
  Response: string;
}

export interface MovieCredits {
  // OMDb API doesn't provide detailed credits, keeping for compatibility
  cast: string; // Actors field from OMDb
  crew: string; // Director, Writer fields from OMDb
}

export interface MovieVideo {
  // OMDb API doesn't provide video data, keeping for compatibility
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Review {
  id: string;
  user_id: string;
  movie_id: string; // Changed to string to match imdbID
  rating: number;
  review_text: string;
  created_at: string;
  user: {
    username: string;
    profile_picture?: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  profile_picture?: string;
  join_date: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: string; // Changed to string to match imdbID
  added_at: string;
  movie: Movie;
}
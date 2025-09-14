import { Movie, MovieDetails, TMDBResponse, MovieCredits, MovieVideo } from '@/types/movie';

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Using the working API key from freekeys
const TMDB_API_KEY = 'ae4bd1b6fce2a5648671bfc171d15ba4'; // Working key from freekeys

console.log('TMDB API key initialized:', TMDB_API_KEY);

// Helper function to construct image URLs
export const getImageUrl = (path: string | null, size: 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Generic fetch function for TMDB API
const fetchFromTMDB = async <T>(endpoint: string): Promise<T> => {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
  console.log('Making TMDB request to:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Get trending movies
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'day'): Promise<TMDBResponse<Movie>> => {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`);
};

// Get popular movies
export const getPopularMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/popular?page=${page}`);
};

// Get top rated movies
export const getTopRatedMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/top_rated?page=${page}`);
};

// Get now playing movies
export const getNowPlayingMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/now_playing?page=${page}`);
};

// Get upcoming movies
export const getUpcomingMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/upcoming?page=${page}`);
};

// Get movie details
export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  return fetchFromTMDB<MovieDetails>(`/movie/${movieId}`);
};

// Get movie credits
export const getMovieCredits = async (movieId: number): Promise<MovieCredits> => {
  return fetchFromTMDB<MovieCredits>(`/movie/${movieId}/credits`);
};

// Get movie videos
export const getMovieVideos = async (movieId: number): Promise<{ results: MovieVideo[] }> => {
  return fetchFromTMDB<{ results: MovieVideo[] }>(`/movie/${movieId}/videos`);
};

// Search movies
export const searchMovies = async (query: string, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const encodedQuery = encodeURIComponent(query);
  return fetchFromTMDB<TMDBResponse<Movie>>(`/search/movie?query=${encodedQuery}&page=${page}`);
};

// Discover movies with filters
export const discoverMovies = async (params: {
  page?: number;
  genre?: number;
  year?: number;
  sortBy?: string;
  rating?: number;
}): Promise<TMDBResponse<Movie>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', (params.page || 1).toString());
  
  if (params.genre) queryParams.append('with_genres', params.genre.toString());
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.rating) queryParams.append('vote_average.gte', params.rating.toString());
  
  return fetchFromTMDB<TMDBResponse<Movie>>(`/discover/movie?${queryParams.toString()}`);
};

// Get movie genres
export const getGenres = async () => {
  return fetchFromTMDB<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
};

// Mock data fallback when API key is not configured
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster_path: "/placeholder-movie.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    release_date: "1994-09-23",
    vote_average: 9.3,
    vote_count: 2836849,
    genre_ids: [18],
    adult: false,
    original_language: "en",
    original_title: "The Shawshank Redemption",
    popularity: 95.5,
    video: false
  },
  {
    id: 2,
    title: "The Godfather",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    poster_path: "/placeholder-movie.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    release_date: "1972-03-24",
    vote_average: 9.2,
    vote_count: 1947387,
    genre_ids: [18, 80],
    adult: false,
    original_language: "en",
    original_title: "The Godfather",
    popularity: 87.2,
    video: false
  }
];
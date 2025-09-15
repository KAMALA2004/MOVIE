import { Movie, MovieDetails, OMDbSearchResponse, MovieCredits, MovieVideo } from '@/types/movie';

// OMDb API configuration
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

// Using the working API key from freekeys
const OMDB_API_KEY = 'b5cff164'; // IMDB key from freekeys

console.log('OMDb API key initialized:', OMDB_API_KEY);

// Helper function to construct image URLs (OMDb provides direct poster URLs)
export const getImageUrl = (posterUrl: string | null, size: 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string => {
  if (!posterUrl || posterUrl === 'N/A') return '/placeholder-movie.jpg';
  return posterUrl;
};

// Generic fetch function for OMDb API
const fetchFromOMDb = async <T>(params: Record<string, string>): Promise<T> => {
  const queryParams = new URLSearchParams({
    apikey: OMDB_API_KEY,
    ...params
  });
  
  const url = `${OMDB_BASE_URL}?${queryParams.toString()}`;
  console.log('Making OMDb request to:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`OMDb API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.Response === 'False') {
    throw new Error(`OMDb API error: ${data.Error}`);
  }
  
  return data;
};

// Get trending movies (using search with popular terms)
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'day'): Promise<{ results: Movie[] }> => {
  // OMDb doesn't have trending, so we'll search for popular movies
  const popularTerms = ['action', 'comedy', 'drama', 'thriller', 'horror', 'romance'];
  const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
  
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: randomTerm,
    type: 'movie',
    page: '1'
  });
  
  return { results: data.Search || [] };
};

// Get trending movies filtered by specific genres
export const getTrendingMoviesByGenre = async (genres: string[] = ['Action', 'Adventure', 'Animation', 'Comedy']): Promise<{ results: Movie[] }> => {
  try {
    // Search for movies from each genre and combine results
    const genrePromises = genres.map(async (genre) => {
      try {
        const data = await fetchFromOMDb<OMDbSearchResponse>({
          s: genre.toLowerCase(),
          type: 'movie',
          page: '1'
        });
        return data.Search || [];
      } catch (error) {
        console.warn(`Failed to fetch movies for genre ${genre}:`, error);
        return [];
      }
    });

    const genreResults = await Promise.all(genrePromises);
    
    // Flatten and deduplicate results
    const allMovies = genreResults.flat();
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.imdbID === movie.imdbID)
    );

    // Shuffle and limit to 20 movies for better variety
    const shuffled = uniqueMovies.sort(() => Math.random() - 0.5);
    
    return { results: shuffled.slice(0, 20) };
  } catch (error) {
    console.error('Error fetching trending movies by genre:', error);
    return { results: [] };
  }
};

// Get popular movies (using search with popular terms)
export const getPopularMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  const popularTerms = ['2023', '2024', 'marvel', 'disney', 'netflix'];
  const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
  
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: randomTerm,
    type: 'movie',
    page: page.toString()
  });
  
  return { results: data.Search || [] };
};

// Get top rated movies (using search with quality terms)
export const getTopRatedMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  const qualityTerms = ['oscar', 'award', 'classic', 'masterpiece', 'cinema'];
  const randomTerm = qualityTerms[Math.floor(Math.random() * qualityTerms.length)];
  
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: randomTerm,
    type: 'movie',
    page: page.toString()
  });
  
  return { results: data.Search || [] };
};

// Get now playing movies (using search with recent terms)
export const getNowPlayingMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  const currentYear = new Date().getFullYear().toString();
  
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: currentYear,
    type: 'movie',
    page: page.toString()
  });
  
  return { results: data.Search || [] };
};

// Get upcoming movies (using search with future terms)
export const getUpcomingMovies = async (page: number = 1): Promise<{ results: Movie[] }> => {
  const nextYear = (new Date().getFullYear() + 1).toString();
  
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: nextYear,
    type: 'movie',
    page: page.toString()
  });
  
  return { results: data.Search || [] };
};

// Get movie details by IMDb ID
export const getMovieDetails = async (movieId: string): Promise<MovieDetails> => {
  return fetchFromOMDb<MovieDetails>({
    i: movieId,
    plot: 'full'
  });
};

// Get movie details by title
export const getMovieByTitle = async (title: string): Promise<MovieDetails> => {
  return fetchFromOMDb<MovieDetails>({
    t: title,
    plot: 'full'
  });
};

// Get movie credits (OMDb provides limited credit info)
export const getMovieCredits = async (movieId: string): Promise<MovieCredits> => {
  const movie = await getMovieDetails(movieId);
  
  return {
    cast: movie.Actors,
    crew: `${movie.Director} | ${movie.Writer}`
  };
};

// Get movie videos (OMDb doesn't provide video data, returning empty)
export const getMovieVideos = async (movieId: string): Promise<{ results: MovieVideo[] }> => {
  return { results: [] };
};

// Search local movies from database
export const searchLocalMovies = async (text: string, page: number = 1): Promise<{ results: Movie[] }> => {
  try {
    const raw = localStorage.getItem('adminMovies');
    const items: any[] = raw ? JSON.parse(raw) : [];
    const lc = text.trim().toLowerCase();
    const all: Movie[] = items
      .filter((m) => {
        const title = (m.title || '').toLowerCase();
        const imdbId = (m.imdb_id || '').toLowerCase();
        if (!lc) return true;
        return title.includes(lc) || imdbId.includes(lc);
      })
      .map((m) => ({
        imdbID: m.imdb_id,
        Title: m.title || 'Untitled',
        Year: m.year ? String(m.year) : 'N/A',
        Rated: m.rated || 'N/A',
        Released: m.released || 'N/A',
        Runtime: m.runtime || 'N/A',
        Genre: m.genre || 'N/A',
        Director: m.director || 'N/A',
        Writer: m.writer || 'N/A',
        Actors: m.actors || 'N/A',
        Plot: m.plot || 'N/A',
        Language: m.language || 'N/A',
        Country: m.country || 'N/A',
        Awards: m.awards || 'N/A',
        Poster: m.poster || '/placeholder-movie.jpg',
        Ratings: [],
        Metascore: 'N/A',
        imdbRating: m.imdb_rating != null ? String(m.imdb_rating) : 'N/A',
        imdbVotes: m.imdb_votes || 'N/A',
        Type: m.type || 'movie',
        DVD: 'N/A',
        BoxOffice: m.box_office || 'N/A',
        Production: m.production || 'N/A',
        Website: m.website || 'N/A',
        Response: 'True',
      }));
    // Simple pagination client-side (20 per page)
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const results = all.slice(start, start + pageSize);
    return { results };
  } catch (error) {
    console.error('Local search (localStorage) error:', error);
    return { results: [] };
  }
};

// Search external movies from OMDb
export const searchExternalMovies = async (query: string, page: number = 1): Promise<{ results: Movie[] }> => {
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: query,
    type: 'movie',
    page: page.toString()
  });
  
  return { results: data.Search || [] };
};

// Search movies (both local and external)
export const searchMovies = async (query: string, page: number = 1): Promise<{ results: Movie[] }> => {
  try {
    // Search both local and external movies in parallel
    const [localResults, externalResults] = await Promise.allSettled([
      searchLocalMovies(query, page),
      searchExternalMovies(query, page).catch(error => {
        if (error.message.includes('OMDb API error: Movie not found!')) {
          console.warn('OMDb API: Movie not found for query:', query);
          return { results: [] }; // Return empty results for this specific error
        }
        console.error('OMDb API error:', error);
        return { results: [] }; // Return empty results for other OMDb errors
      })
    ]);
    
    // Extract results from settled promises
    const localMovies = localResults.status === 'fulfilled' ? localResults.value.results : [];
    const externalMovies = externalResults.status === 'fulfilled' ? externalResults.value.results : [];
    
    // Combine results, prioritizing local movies first
    const combinedResults = [...localMovies, ...externalMovies];
    
    console.log(`Search for "${query}": Found ${localMovies.length} local + ${externalMovies.length} external = ${combinedResults.length} total movies`);
    
    return { results: combinedResults };
  } catch (error) {
    console.error('General search error:', error);
    // Fallback to local search only
    try {
      const localResults = await searchLocalMovies(query, page);
      return localResults;
    } catch (localError) {
      console.error('Local search also failed:', localError);
      return { results: [] };
    }
  }
};

// Discover movies with filters (OMDb has limited filtering)
export const discoverMovies = async (params: {
  page?: number;
  genre?: string;
  year?: number;
  sortBy?: string;
  rating?: number;
}): Promise<{ results: Movie[] }> => {
  let searchTerm = '';
  
  if (params.genre) {
    searchTerm = params.genre;
  } else if (params.year) {
    searchTerm = params.year.toString();
  } else {
    searchTerm = 'movie';
  }
  
  const data = await fetchFromOMDb<OMDbSearchResponse>({
    s: searchTerm,
    type: 'movie',
    page: (params.page || 1).toString(),
    y: params.year?.toString() || ''
  });
  
  return { results: data.Search || [] };
};

// Get movie genres (OMDb doesn't have a genre list endpoint)
export const getGenres = async () => {
  return {
    genres: [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' },
      { id: 3, name: 'Animation' },
      { id: 4, name: 'Biography' },
      { id: 5, name: 'Comedy' },
      { id: 6, name: 'Crime' },
      { id: 7, name: 'Documentary' },
      { id: 8, name: 'Drama' },
      { id: 9, name: 'Family' },
      { id: 10, name: 'Fantasy' },
      { id: 11, name: 'Film-Noir' },
      { id: 12, name: 'History' },
      { id: 13, name: 'Horror' },
      { id: 14, name: 'Music' },
      { id: 15, name: 'Musical' },
      { id: 16, name: 'Mystery' },
      { id: 17, name: 'Romance' },
      { id: 18, name: 'Sci-Fi' },
      { id: 19, name: 'Sport' },
      { id: 20, name: 'Thriller' },
      { id: 21, name: 'War' },
      { id: 22, name: 'Western' }
    ]
  };
};

// Mock data fallback when API key is not configured
export const mockMovies: Movie[] = [
  {
    imdbID: "tt0111161",
    Title: "The Shawshank Redemption",
    Year: "1994",
    Rated: "R",
    Released: "14 Oct 1994",
    Runtime: "142 min",
    Genre: "Drama",
    Director: "Frank Darabont",
    Writer: "Stephen King, Frank Darabont",
    Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
    Plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    Language: "English",
    Country: "United States",
    Awards: "Nominated for 7 Oscars. 21 wins & 44 nominations total",
    Poster: "/placeholder-movie.jpg",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.3/10" },
      { Source: "Rotten Tomatoes", Value: "91%" },
      { Source: "Metacritic", Value: "80/100" }
    ],
    Metascore: "80",
    imdbRating: "9.3",
    imdbVotes: "2,836,849",
    Type: "movie",
    DVD: "27 Jan 1998",
    BoxOffice: "$28,767,189",
    Production: "N/A",
    Website: "N/A",
    Response: "True"
  },
  {
    imdbID: "tt0068646",
    Title: "The Godfather",
    Year: "1972",
    Rated: "R",
    Released: "24 Mar 1972",
    Runtime: "175 min",
    Genre: "Crime, Drama",
    Director: "Francis Ford Coppola",
    Writer: "Mario Puzo, Francis Ford Coppola",
    Actors: "Marlon Brando, Al Pacino, James Caan",
    Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    Language: "English, Italian, Latin",
    Country: "United States",
    Awards: "Won 3 Oscars. 24 wins & 30 nominations total",
    Poster: "/placeholder-movie.jpg",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.2/10" },
      { Source: "Rotten Tomatoes", Value: "97%" },
      { Source: "Metacritic", Value: "100/100" }
    ],
    Metascore: "100",
    imdbRating: "9.2",
    imdbVotes: "1,947,387",
    Type: "movie",
    DVD: "09 Oct 2001",
    BoxOffice: "$134,966,411",
    Production: "N/A",
    Website: "N/A",
    Response: "True"
  }
];

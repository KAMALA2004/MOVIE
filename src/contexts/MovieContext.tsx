import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Movie } from '@/types/movie';

interface Review {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  review_text?: string;
  is_spoiler: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    profile_picture?: string;
  };
}

interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: string;
  status: 'want_to_watch' | 'watching' | 'watched';
  notes?: string;
  priority: number;
  movie: Movie;
}

interface MovieState {
  watchlist: WatchlistItem[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

interface MovieContextType extends MovieState {
  addToWatchlist: (movieId: string, status?: string, notes?: string) => Promise<void>;
  removeFromWatchlist: (movieId: string) => Promise<void>;
  updateWatchlistItem: (movieId: string, data: Partial<WatchlistItem>) => Promise<void>;
  submitReview: (movieId: string, rating: number, reviewText?: string, isSpoiler?: boolean) => Promise<void>;
  updateReview: (reviewId: string, rating: number, reviewText?: string, isSpoiler?: boolean) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  fetchWatchlist: () => Promise<void>;
  fetchUserReviews: (userId: string) => Promise<void>;
  clearError: () => void;
}

type MovieAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WATCHLIST'; payload: WatchlistItem[] }
  | { type: 'ADD_TO_WATCHLIST'; payload: WatchlistItem }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | { type: 'UPDATE_WATCHLIST_ITEM'; payload: WatchlistItem }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_REVIEW'; payload: Review }
  | { type: 'REMOVE_REVIEW'; payload: string };

const initialState: MovieState = {
  watchlist: [],
  reviews: [],
  isLoading: false,
  error: null,
};

const movieReducer = (state: MovieState, action: MovieAction): MovieState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_WATCHLIST':
      return {
        ...state,
        watchlist: action.payload,
      };
    case 'ADD_TO_WATCHLIST':
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      };
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(item => item.movie_id !== action.payload),
      };
    case 'UPDATE_WATCHLIST_ITEM':
      return {
        ...state,
        watchlist: state.watchlist.map(item =>
          item.movie_id === action.payload.movie_id ? action.payload : item
        ),
      };
    case 'SET_REVIEWS':
      return {
        ...state,
        reviews: action.payload,
      };
    case 'ADD_REVIEW':
      return {
        ...state,
        reviews: [action.payload, ...state.reviews],
      };
    case 'UPDATE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map(review =>
          review.id === action.payload.id ? action.payload : review
        ),
      };
    case 'REMOVE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.filter(review => review.id !== action.payload),
      };
    default:
      return state;
  }
};

const MovieContext = createContext<MovieContextType | undefined>(undefined);

// Use centralized API base URL (configured via VITE_API_BASE_URL)

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }, []);

  const addToWatchlist = async (movieId: string, status = 'want_to_watch', notes?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/watchlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ movie_id: movieId, status, notes }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'ADD_TO_WATCHLIST', payload: data.watchlist_item });
      } else {
        throw new Error(data.message || 'Failed to add to watchlist');
      }
    } catch (error) {
      console.error('Add to watchlist error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add to watchlist' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movieId });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove from watchlist' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateWatchlistItem = async (movieId: string, data: Partial<WatchlistItem>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/watchlist/${movieId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_WATCHLIST_ITEM', payload: responseData.watchlist_item });
      } else {
        throw new Error(responseData.message || 'Failed to update watchlist item');
      }
    } catch (error) {
      console.error('Update watchlist error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update watchlist item' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitReview = async (movieId: string, rating: number, reviewText?: string, isSpoiler = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/movies/${movieId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, review_text: reviewText, is_spoiler: isSpoiler }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'ADD_REVIEW', payload: data.review });
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to submit review' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateReview = async (reviewId: string, rating: number, reviewText?: string, isSpoiler = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, review_text: reviewText, is_spoiler: isSpoiler }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_REVIEW', payload: data.review });
      } else {
        throw new Error(data.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Update review error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update review' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteReview = async (reviewId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        dispatch({ type: 'REMOVE_REVIEW', payload: reviewId });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Delete review error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete review' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchWatchlist = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/watchlist`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_WATCHLIST', payload: data.watchlist });
      } else {
        throw new Error(data.message || 'Failed to fetch watchlist');
      }
    } catch (error) {
      console.error('Fetch watchlist error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch watchlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchUserReviews = async (userId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_REVIEWS', payload: data.reviews });
      } else {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch reviews' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: MovieContextType = {
    ...state,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    submitReview,
    updateReview,
    deleteReview,
    fetchWatchlist,
    fetchUserReviews,
    clearError,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovie = (): MovieContextType => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovie must be used within a MovieProvider');
  }
  return context;
};

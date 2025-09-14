import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: string;
  status: 'want_to_watch' | 'watching' | 'watched';
  notes?: string;
  priority: number;
  created_at: string;
  updated_at: string;
  movie: {
    id: string;
    title: string;
    year: number;
    poster?: string;
    imdb_rating?: number;
    average_rating?: number;
    total_reviews?: number;
  };
}

interface WatchlistState {
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
}

interface WatchlistContextType extends WatchlistState {
  addToWatchlist: (movieId: string, status?: string, notes?: string, priority?: number) => Promise<void>;
  removeFromWatchlist: (itemId: string) => Promise<void>;
  updateWatchlistItem: (itemId: string, updates: Partial<WatchlistItem>) => Promise<void>;
  fetchWatchlist: (page?: number, status?: string) => Promise<void>;
  checkInWatchlist: (movieId: string) => Promise<{ inWatchlist: boolean; watchlistItem: WatchlistItem | null }>;
  clearError: () => void;
}

type WatchlistAction =
  | { type: 'WATCHLIST_START' }
  | { type: 'WATCHLIST_SUCCESS'; payload: { items: WatchlistItem[]; pagination: any } }
  | { type: 'WATCHLIST_FAILURE'; payload: string }
  | { type: 'ADD_ITEM'; payload: WatchlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: WatchlistItem }
  | { type: 'CLEAR_ERROR' };

const initialState: WatchlistState = {
  items: [],
  isLoading: false,
  error: null,
  pagination: null,
};

const watchlistReducer = (state: WatchlistState, action: WatchlistAction): WatchlistState => {
  switch (action.type) {
    case 'WATCHLIST_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'WATCHLIST_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case 'WATCHLIST_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [action.payload, ...state.items],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080/api';

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();

  const fetchWatchlist = async (page = 1, status?: string) => {
    if (!isAuthenticated || !token) return;

    dispatch({ type: 'WATCHLIST_START' });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (status) params.append('status', status);

      const response = await fetch(`${API_BASE_URL}/watchlist?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      dispatch({
        type: 'WATCHLIST_SUCCESS',
        payload: { items: data.watchlist, pagination: data.pagination },
      });
    } catch (error) {
      dispatch({
        type: 'WATCHLIST_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to fetch watchlist',
      });
    }
  };

  const addToWatchlist = async (
    imdbId: string,
    status = 'want_to_watch',
    notes?: string,
    priority = 0
  ) => {
    if (!isAuthenticated || !token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imdb_id: imdbId,
          status,
          notes,
          priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to watchlist');
      }

      const data = await response.json();
      dispatch({ type: 'ADD_ITEM', payload: data.watchlistItem });
    } catch (error) {
      throw error;
    }
  };

  const removeFromWatchlist = async (itemId: string) => {
    if (!isAuthenticated || !token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from watchlist');
      }

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      throw error;
    }
  };

  const updateWatchlistItem = async (itemId: string, updates: Partial<WatchlistItem>) => {
    if (!isAuthenticated || !token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update watchlist item');
      }

      const data = await response.json();
      dispatch({ type: 'UPDATE_ITEM', payload: data.watchlistItem });
    } catch (error) {
      throw error;
    }
  };

  const checkInWatchlist = async (imdbId: string) => {
    if (!isAuthenticated || !token) {
      return { inWatchlist: false, watchlistItem: null };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/check/${imdbId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { inWatchlist: false, watchlistItem: null };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { inWatchlist: false, watchlistItem: null };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Fetch watchlist when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWatchlist();
    }
  }, [isAuthenticated, user]);

  const value: WatchlistContextType = {
    ...state,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    fetchWatchlist,
    checkInWatchlist,
    clearError,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

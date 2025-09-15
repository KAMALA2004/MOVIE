import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
// Demo Mode: localStorage-based persistence
import { getMovieDetails } from '@/lib/omdb';

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

// Firestore-based watchlist; no backend API needed

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  const storageKey = (uid: string) => `watchlist:${uid}`;

  const fetchWatchlist = async (page = 1, status?: string) => {
    if (!isAuthenticated || !user) return;
    dispatch({ type: 'WATCHLIST_START' });
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      const list: WatchlistItem[] = raw ? JSON.parse(raw) : [];
      const items = status ? list.filter(i => i.status === status) : list;
      dispatch({ type: 'WATCHLIST_SUCCESS', payload: { items, pagination: null } });
    } catch (error) {
      dispatch({ type: 'WATCHLIST_FAILURE', payload: error instanceof Error ? error.message : 'Failed to fetch watchlist' });
    }
  };

  const addToWatchlist = async (
    imdbId: string,
    status = 'want_to_watch',
    notes?: string,
    priority = 0
  ) => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    const now = new Date().toISOString();
    // Optimistic UI: update first, then persist to localStorage
    // Try to enrich with movie details for watchlist rendering
    let movieTitle = '';
    let movieYear: number = new Date().getFullYear();
    let moviePoster: string | undefined = undefined;
    let imdbRating: number | undefined = undefined;
    try {
      const details = await getMovieDetails(imdbId);
      movieTitle = details.Title || '';
      movieYear = parseInt(details.Year) || movieYear;
      moviePoster = details.Poster && details.Poster !== 'N/A' ? details.Poster : undefined;
      imdbRating = details.imdbRating ? parseFloat(details.imdbRating) : undefined;
    } catch (_) {
      // ignore fetch failures; we'll store minimal data
    }
    const newItem: WatchlistItem = {
      id: imdbId,
      user_id: user.id,
      movie_id: imdbId,
      status,
      notes: notes || undefined,
      priority: priority ?? 0,
      created_at: now,
      updated_at: now,
      movie: {
        id: imdbId,
        title: movieTitle || imdbId,
        year: movieYear,
        poster: moviePoster,
        imdb_rating: imdbRating,
      },
    } as any;
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    const raw = localStorage.getItem(storageKey(user.id));
    const list: WatchlistItem[] = raw ? JSON.parse(raw) : [];
    const next = [newItem, ...list.filter(i => i.id !== imdbId)];
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
  };

  const removeFromWatchlist = async (itemId: string) => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    const raw = localStorage.getItem(storageKey(user.id));
    const list: WatchlistItem[] = raw ? JSON.parse(raw) : [];
    const next = list.filter(i => i.id !== itemId);
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateWatchlistItem = async (itemId: string, updates: Partial<WatchlistItem>) => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    const now = new Date().toISOString();
    const existing = state.items.find(i => i.id === itemId);
    const updated: WatchlistItem = { ...(existing as WatchlistItem), ...(updates as any), updated_at: now };
    const raw = localStorage.getItem(storageKey(user.id));
    const list: WatchlistItem[] = raw ? JSON.parse(raw) : [];
    const next = list.map(i => (i.id === itemId ? updated : i));
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
    dispatch({ type: 'UPDATE_ITEM', payload: updated });
  };

  const checkInWatchlist = async (imdbId: string) => {
    if (!isAuthenticated || !user) return { inWatchlist: false, watchlistItem: null };
    const raw = localStorage.getItem(storageKey(user.id));
    const list: WatchlistItem[] = raw ? JSON.parse(raw) : [];
    const item = list.find(i => i.id === imdbId) || null;
    return { inWatchlist: Boolean(item), watchlistItem: item };
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

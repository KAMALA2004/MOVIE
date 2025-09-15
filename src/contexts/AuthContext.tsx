import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface User {
  id: string;
  username?: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  is_admin: boolean;
  created_at?: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          dispatch({ type: 'AUTH_FAILURE' });
          return;
        }
        let profile: any = {};
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          profile = profileDoc.exists() ? profileDoc.data() : {};
        } catch (e) {
          // Ignore profile read errors (e.g., missing rules/doc); still authenticate user
          profile = {};
        }
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: profile?.username || firebaseUser.displayName || firebaseUser.email || undefined,
          profile_picture: profile?.profile_picture || firebaseUser.photoURL || undefined,
          bio: profile?.bio,
          is_admin: Boolean(profile?.is_admin),
          created_at: profile?.created_at,
          last_login: new Date().toISOString(),
        };
        dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      } catch (err) {
        console.error('onAuthStateChanged handler error:', err);
        dispatch({ type: 'AUTH_FAILURE' });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      const user: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        username: fbUser.displayName || fbUser.email || undefined,
        profile_picture: fbUser.photoURL || undefined,
        is_admin: false,
        created_at: undefined,
        last_login: new Date().toISOString(),
      };
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (username) await updateFirebaseProfile(cred.user, { displayName: username });
      const fbUser = cred.user;
      const user: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        username: username || fbUser.email || undefined,
        profile_picture: fbUser.photoURL || undefined,
        is_admin: false,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) throw new Error('User not authenticated');
    try {
      await updateFirebaseProfile(auth.currentUser, {
        displayName: data.username,
        photoURL: data.profile_picture,
      });
      const updated: User = {
        ...(state.user as User),
        username: data.username ?? state.user?.username,
        profile_picture: data.profile_picture ?? state.user?.profile_picture,
        bio: data.bio ?? state.user?.bio,
      } as User;
      dispatch({ type: 'UPDATE_USER', payload: updated });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

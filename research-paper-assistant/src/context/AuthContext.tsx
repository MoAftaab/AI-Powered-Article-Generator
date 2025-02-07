import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  User,
  AuthError 
} from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('AuthProvider render', { loading, user: user?.email });

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('Starting sign in process...');
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase Auth sign in successful');
      
      // Test Firestore access after sign in
      const testDoc = doc(db, `_test_auth/${email}`);
      try {
        await setDoc(testDoc, {
          lastSignIn: new Date(),
          email,
          uid: userCredential.user.uid
        });
        console.log('Firestore write test successful');
        await deleteDoc(testDoc);
      } catch (firestoreError) {
        console.error('Firestore access test failed:', firestoreError);
        // Sign out if Firestore access fails
        await signOut(auth);
        throw new Error('Authentication successful but database access failed. Please check your connection and try again.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      const authError = err as AuthError;
      setError(authError.message || 'Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('Starting sign up process...');
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase Auth sign up successful');
      
      // Test Firestore access after sign up
      const testDoc = doc(db, `_test_auth/${email}`);
      try {
        await setDoc(testDoc, {
          createdAt: new Date(),
          email,
          uid: userCredential.user.uid
        });
        console.log('Firestore write test successful');
        await deleteDoc(testDoc);
      } catch (firestoreError) {
        console.error('Firestore access test failed:', firestoreError);
        // Sign out if Firestore access fails
        await signOut(auth);
        throw new Error('Account created but database access failed. Please try signing in again.');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      const authError = err as AuthError;
      setError(authError.message || 'Failed to sign up');
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      await signOut(auth);
      console.log('Sign out successful');
    } catch (err) {
      console.error('Sign out error:', err);
      const authError = err as AuthError;
      setError(authError.message || 'Failed to sign out');
      throw err;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, 
      async (currentUser) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', { 
          user: currentUser?.email,
          authenticated: !!currentUser 
        });

        if (currentUser) {
          // Test Firestore access when auth state changes to signed in
          try {
            const testDoc = doc(db, `_test_auth/${currentUser.email}`);
            await setDoc(testDoc, {
              lastActive: new Date(),
              email: currentUser.email
            });
            await deleteDoc(testDoc);
            console.log('Firestore access verified on auth state change');
          } catch (error) {
            console.error('Firestore access failed on auth state change:', error);
            setError('Lost database access. Please sign in again.');
            await signOut(auth);
            return;
          }
        }

        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        if (!mounted) return;
        
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOutUser }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500">Initializing authentication...</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

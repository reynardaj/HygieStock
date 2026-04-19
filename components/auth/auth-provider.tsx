'use client';

import * as React from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  householdId: string | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [householdId, setHouseholdId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile and householdId
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setHouseholdId(userDoc.data().householdId);
        } else {
          // New user, create profile
          // For MVP, we'll assign them to a default household or let them create one
          const defaultHouseholdId = 'default-household';
          
          // Ensure the default household exists
          const householdDoc = await getDoc(doc(db, 'households', defaultHouseholdId));
          if (!householdDoc.exists()) {
            await setDoc(doc(db, 'households', defaultHouseholdId), {
              id: defaultHouseholdId,
              name: 'My Household',
              members: [user.uid]
            });
          } else {
            // Add user to existing default household members if not already there
            const members = householdDoc.data().members || [];
            if (!members.includes(user.uid)) {
              await setDoc(doc(db, 'households', defaultHouseholdId), {
                ...householdDoc.data(),
                members: [...members, user.uid]
              });
            }
          }

          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            householdId: defaultHouseholdId
          });
          setHouseholdId(defaultHouseholdId);
        }
      } else {
        setHouseholdId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, householdId, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

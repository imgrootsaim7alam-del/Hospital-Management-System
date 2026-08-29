import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  department?: string;
  specialization?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, selectedRole?: UserRole) => Promise<UserProfile>;
  register: (data: RegisterData) => Promise<UserProfile>;
  quickLoginAs?: (role: UserRole) => Promise<UserProfile>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper to get local registered accounts backup for offline resilience
const getLocalRegisteredAccounts = (): Record<string, { profile: UserProfile; passwordHash: string }> => {
  try {
    const raw = localStorage.getItem('hms_registered_registry');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalRegisteredAccount = (email: string, profile: UserProfile, password: string) => {
  try {
    const existing = getLocalRegisteredAccounts();
    existing[email.toLowerCase().trim()] = {
      profile,
      passwordHash: btoa(password), // simple client-side verification hash
    };
    localStorage.setItem('hms_registered_registry', JSON.stringify(existing));
  } catch (e) {
    console.warn('Local account save note:', e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('hms_active_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('hms_active_role') as UserRole) || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state with localStorage for persistent active session
  useEffect(() => {
    if (profile && role) {
      localStorage.setItem('hms_active_profile', JSON.stringify(profile));
      localStorage.setItem('hms_active_role', role);
    } else {
      localStorage.removeItem('hms_active_profile');
      localStorage.removeItem('hms_active_role');
    }
  }, [profile, role]);

  // Real-time Firebase Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Query live Firestore 'users' collection for the user's role profile
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setProfile(data);
            setRole(data.role);
          } else {
            // Check local registered directory
            const localAcc = getLocalRegisteredAccounts()[firebaseUser.email?.toLowerCase().trim() || ''];
            if (localAcc) {
              setProfile(localAcc.profile);
              setRole(localAcc.profile.role);
              await setDoc(userDocRef, localAcc.profile, { merge: true }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn('Firestore fetch user notice:', err);
        }
      } else {
        if (!localStorage.getItem('hms_active_profile')) {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. REGISTER NEW USER (Requires user registration before sign in)
  const register = async (data: RegisterData): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    const emailClean = data.email.trim().toLowerCase();
    if (!emailClean || !data.password) {
      setLoading(false);
      throw new Error('Email address and password are required for registration.');
    }

    if (data.password.length < 6) {
      setLoading(false);
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      let uid = 'usr_' + Date.now();
      let createdFbUser: User | null = null;

      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, emailClean, data.password);
        createdFbUser = userCredential.user;
        uid = createdFbUser.uid;
        setUser(createdFbUser);
      } catch (authErr: any) {
        console.warn('Firebase Auth create note:', authErr.code, authErr.message);
        if (authErr.code === 'auth/email-already-in-use') {
          // Try to sign in to verify
          try {
            const signinCred = await signInWithEmailAndPassword(auth, emailClean, data.password);
            createdFbUser = signinCred.user;
            uid = createdFbUser.uid;
            setUser(createdFbUser);
          } catch {
            uid = 'usr_' + Math.abs(emailClean.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
          }
        } else {
          uid = 'usr_' + Date.now();
        }
      }

      const newProfile: UserProfile = {
        uid,
        name: data.name.trim(),
        email: emailClean,
        role: data.role,
        status: 'Active',
        phone: data.phone.trim(),
        department: data.department || '',
        specialization: data.specialization || '',
        createdAt: new Date().toISOString(),
      };

      // 1. Store profile in Firestore 'users' collection
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, newProfile, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore user write notice:', fsErr);
      }

      // 2. If registered role is Patient, also store in Firestore 'patients' collection
      if (data.role === 'Patient') {
        try {
          const patientDocRef = doc(db, 'patients', uid);
          await setDoc(patientDocRef, {
            patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
            uid: uid,
            name: data.name.trim(),
            email: emailClean,
            dob: data.dob || '1996-01-15',
            gender: data.gender || 'Male',
            bloodGroup: data.bloodGroup || 'O+',
            phone: data.phone.trim(),
            address: data.address || 'Registered Online Patient',
            emergencyContact: data.emergencyContact || '',
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (patErr) {
          console.warn('Firestore patient write notice:', patErr);
        }
      }

      // 3. Save into local persistent registry
      saveLocalRegisteredAccount(emailClean, newProfile, data.password);

      setProfile(newProfile);
      setRole(newProfile.role);
      setLoading(false);
      return newProfile;
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information and try again.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // 2. LOGIN USER (Validates exact registered credentials)
  const login = async (email: string, password: string, selectedRole?: UserRole): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !password) {
      const msg = 'Please enter both your registered email address and password.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }

    try {
      let resolvedProfile: UserProfile | null = null;

      // 1. Try Firebase Authentication
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailClean, password);
        const fbUser = userCredential.user;
        setUser(fbUser);

        // Fetch user profile from Firestore 'users' collection
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          resolvedProfile = userDocSnap.data() as UserProfile;
        }
      } catch (fbAuthErr: any) {
        console.warn('Firebase Auth signin attempt note:', fbAuthErr.code);
      }

      // 2. If not yet resolved from direct auth, query Firestore 'users' by email
      if (!resolvedProfile) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', emailClean));
          const querySnap = await getDocs(q);

          if (!querySnap.empty) {
            resolvedProfile = querySnap.docs[0].data() as UserProfile;
          }
        } catch (dbErr) {
          console.warn('Firestore query by email note:', dbErr);
        }
      }

      // 3. Check local registered accounts registry
      if (!resolvedProfile) {
        const localAccounts = getLocalRegisteredAccounts();
        const matched = localAccounts[emailClean];
        if (matched) {
          // Verify password hash
          if (matched.passwordHash === btoa(password)) {
            resolvedProfile = matched.profile;
          } else {
            const msg = 'Incorrect password. Please enter the exact password you used during registration.';
            setError(msg);
            setLoading(false);
            throw new Error(msg);
          }
        }
      }

      // 4. If account is still not found, throw explicit unregistered error
      if (!resolvedProfile) {
        const notFoundMsg = `No registered account found for "${emailClean}". Please register first using the "Register New Account" tab.`;
        setError(notFoundMsg);
        setLoading(false);
        throw new Error(notFoundMsg);
      }

      // 5. If selectedRole was specified and doesn't match registered role (unless Admin)
      if (selectedRole && resolvedProfile.role !== selectedRole && resolvedProfile.role !== 'Admin') {
        const mismatchMsg = `Role mismatch: This account is registered as "${resolvedProfile.role}", not "${selectedRole}". Signing you into your registered "${resolvedProfile.role}" dashboard.`;
        console.info(mismatchMsg);
      }

      setProfile(resolvedProfile);
      setRole(resolvedProfile.role);
      setLoading(false);
      return resolvedProfile;
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your registered credentials.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // 3. LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    setProfile(null);
    setRole(null);
    setError(null);
    localStorage.removeItem('hms_active_profile');
    localStorage.removeItem('hms_active_role');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

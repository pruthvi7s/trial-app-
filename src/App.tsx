/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from './components/Auth';
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AssessmentForm from './components/AssessmentForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('student');
  const [view, setView] = useState<'assessment' | 'admin'>('assessment');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: 'student',
            createdAt: new Date()
          });
          setRole('student');
        } else {
          setRole(userDoc.data().role);
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in window closed by user.');
      } else {
        console.error('Sign in failed', error);
        alert('Sign in failed. Please try again.');
      }
    }
  };

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      console.error('Email Auth failed', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 flex flex-col">
      <header className="flex flex-wrap justify-between items-center mb-10 border-b border-gold pb-4 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold">Infinix Academy</h1>
        {user && (
          <nav className="flex flex-wrap space-x-2 sm:space-x-4">
            <button onClick={() => setView('assessment')} className="text-white hover:text-gold">Assessment</button>
            {role === 'admin' && (
              <button onClick={() => setView('admin')} className="text-white hover:text-gold">Admin</button>
            )}
            <button onClick={() => auth.signOut()} className="text-gray-400 hover:text-white">Sign Out</button>
          </nav>
        )}
      </header>

      {!user ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-bold text-gold mb-6">Unlock Your Future</motion.h2>
          <p className="text-xl text-gray-400 mb-10 text-center max-w-lg">Infinix Academy uses AI to provide personalized career guidance, learning roadmaps, and professional assessments.</p>
          
          <div className="space-y-4 w-full max-w-sm">
            <input type="email" placeholder="Email" className="w-full p-3 bg-black border border-gold rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-3 bg-black border border-gold rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleEmailAuth} className="w-full bg-gold text-black px-8 py-3 rounded font-semibold text-lg">
              {isSignUp ? 'Sign Up' : 'Sign In'} with Email
            </button>
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-400 underline">
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

          <div className="my-6 text-gray-500">OR</div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignIn}
            className="bg-white text-black px-8 py-3 rounded font-semibold text-lg flex items-center gap-2"
          >
            Sign in with Google
          </motion.button>
        </div>
      ) : (
        <main className="flex-grow">
          {view === 'assessment' ? <AssessmentForm /> : <AdminDashboard />}
        </main>
      )}
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm border-t border-gray-800">
        Created by Sneha and Sadguru
      </footer>
    </div>
  );
}

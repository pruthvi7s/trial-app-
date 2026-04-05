/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { signInWithGoogle } from './components/Auth';
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AssessmentForm from './components/AssessmentForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('student');
  const [view, setView] = useState<'assessment' | 'admin'>('assessment');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="flex justify-between items-center mb-10 border-b border-gold pb-4">
        <h1 className="text-3xl font-bold text-gold">Infinix Academy</h1>
        {user && (
          <nav className="space-x-4">
            <button onClick={() => setView('assessment')} className="text-white hover:text-gold">Assessment</button>
            {role === 'admin' && (
              <button onClick={() => setView('admin')} className="text-white hover:text-gold">Admin</button>
            )}
            <button onClick={() => auth.signOut()} className="text-gray-400 hover:text-white">Sign Out</button>
          </nav>
        )}
      </header>

      {!user ? (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-bold text-gold mb-6">Unlock Your Future</motion.h2>
          <p className="text-xl text-gray-400 mb-10 text-center max-w-lg">Infinix Academy uses AI to provide personalized career guidance, learning roadmaps, and professional assessments.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignIn}
            className="bg-gold text-black px-8 py-3 rounded-full font-semibold text-lg"
          >
            Sign in with Google
          </motion.button>
        </div>
      ) : (
        <main>
          {view === 'assessment' ? <AssessmentForm /> : <AdminDashboard />}
        </main>
      )}
    </div>
  );
}

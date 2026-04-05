import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    await signInWithRedirect(auth, provider);
  } else {
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in window closed by user.');
      } else {
        console.error('Error signing in with Google', error);
        throw error;
      }
    }
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing up with email', error);
    throw error;
  }
};

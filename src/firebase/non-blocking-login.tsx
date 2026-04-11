'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(error => {
    console.error('Anonymous sign-in error:', error);
    // Emit a generic auth error
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'auth/anonymous',
      operation: 'create',
      requestResourceData: { error: error.message }
    }));
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error('Email sign-up error:', error);
    // Emit a generic auth error
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'auth/email-signup',
      operation: 'create',
      requestResourceData: { email, error: error.message }
    }));
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error('Email sign-in error:', error);
    // Emit a generic auth error
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'auth/email-signin',
      operation: 'create',
      requestResourceData: { email, error: error.message }
    }));
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

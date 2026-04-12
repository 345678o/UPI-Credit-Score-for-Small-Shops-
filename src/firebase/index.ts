'use client';

// Export core initialization
export * from './init';

// Export components and providers
export * from './provider';
export * from './client-provider';

// Export hooks and utilities
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Import hooks for the dashboard to use (legacy compat)
export { useUser } from './provider';
export { useAuth } from './provider';
export { useMemoFirebase } from './provider';

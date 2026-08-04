// src/composables/useAuth.js
// Hook auth: bungkus store auth + entri login Strava.
import { authState, initAuth, reloadAuth, signInAdmin, signOut } from '../store/auth.js'
import { connectStrava } from '../store/strava.js'

export function useAuth() {
  return {
    auth: authState,        // reactive readonly: isLoggedIn, userRole, userName, userEmail, athleteId
    initAuth,
    reloadAuth,
    signInAdmin,            // (email, password) => role
    signInWithStrava: connectStrava, // redirect OAuth Strava
    signOut,
  }
}

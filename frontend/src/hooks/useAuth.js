import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — Access authentication state and actions.
 *
 * Returns:
 *  - user        : current logged-in user object (or null)
 *  - token       : JWT token string (or null)
 *  - isAdmin     : boolean, true if user has admin role
 *  - login()     : async fn to log in a student
 *  - adminLogin(): async fn to log in as admin
 *  - register()  : async fn to register a new student
 *  - logout()    : clears auth state
 *  - loading     : request in-flight flag
 *  - error       : error message string (or null)
 *
 * Routes used:
 *  POST /api/auth/student/register
 *  POST /api/auth/student/login
 *  POST /api/auth/admin/login
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;

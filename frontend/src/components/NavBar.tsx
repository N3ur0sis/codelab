/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Navbar.tsx - Navigation bar component for the frontend application.
 *
 * Key Features:
 * - Displays a "Sign in with GitHub" button for unauthenticated users.
 * - Displays a "Sign out" button and the user's name for authenticated users.
 * - Integrates with the backend for authentication and logout.
 */

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Backend URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const Navbar: React.FC = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user session details from the backend.
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/auth/session`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        setUser(null); // Reset user state if not authenticated
      } finally {
        setLoading(false); // Ensure loading is set to false after attempt
      }
    };
    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`; // Redirect to backend GitHub login route
  };

  const handleLogout = () => {
    window.location.href = `${BACKEND_URL}/auth/logout`; // Redirect to backend logout route
  };

  if (loading) {
    return null; // Avoid rendering anything while loading
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">CodeLab</h1>
        <div>
          {!user ? (
            <button
              onClick={handleLogin}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Sign in with GitHub
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

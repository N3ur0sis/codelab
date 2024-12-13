/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Home.tsx - Home page component for the frontend application.
 *
 * Key Features:
 * - Dynamically displays user information post-authentication.
 * - Shows a fallback message for unauthenticated users.
 * - Designed with a simple and responsive UI using Tailwind CSS.
 */

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Backend URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: number;
  name: string;
  email?: string;
}

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

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
      }
    };
    fetchUser();
  }, []);

  /**
   * JSX Structure
   * Displays a welcome message for authenticated users and fallback for unauthenticated users.
   */
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {user ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user.name}!
          </h1>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-gray-800">
          Please log in to continue.
        </h1>
      )}
    </main>
  );
};

export default Home;

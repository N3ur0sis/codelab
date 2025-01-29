/**
 * page.tsx - Main homepage of the application.
 *
 * Key Features:
 * - Shows a "Login" button for unauthenticated users.
 * - Displays a list of challenges for authenticated users.
 * - Redirects to the challenge page when a challenge is selected.
 */
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const Homepage: React.FC = () => {
  const [user, setUser] = useState<{ name: string; user_role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/auth/session`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={() => (window.location.href = `${BACKEND_URL}/auth/github`)}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Please Login
        </button>
      </main>
    );
  }

  // Redirect to the appropriate dashboard based on the user's role
  return <p>Unauthorized</p>;
};

export default Homepage;
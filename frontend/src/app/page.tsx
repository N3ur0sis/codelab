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
import { useRouter } from 'next/navigation';

// Backend API URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface Challenge {
  id: number;
  title: string;
  description: string;
}

const Homepage: React.FC = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  /**
   * Fetch challenges from the backend.
   */
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return; // Fetch challenges only if the user is logged in
      try {
        const response = await axios.get(`${BACKEND_URL}/challenges`, {
          withCredentials: true,
        });
        setChallenges(response.data);
      } catch (err) {
        console.error('Error fetching challenges:', err);
      }
    };
    fetchChallenges();
  }, [user]);

  /**
   * Handle challenge selection.
   */
  const handleChallengeClick = (challengeId: number) => {
    router.push(`/challenges/${challengeId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!user ? (
        <button
          onClick={() => (window.location.href = `${BACKEND_URL}/auth/github`)}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Please Login
        </button>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <div className="mt-6 w-full max-w-4xl">
            {challenges.length > 0 ? (
              <ul className="space-y-4">
                {challenges.map((challenge) => (
                  <li
                    key={challenge.id}
                    className="p-4 bg-white shadow-md rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => handleChallengeClick(challenge.id)}
                  >
                    <h2 className="text-lg font-bold">{challenge.title}</h2>
                    <p>{challenge.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No challenges available at the moment.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default Homepage;

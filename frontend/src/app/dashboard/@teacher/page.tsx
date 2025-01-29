'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface Challenge {
  id: number;
  title: string;
  description: string;
}

const TeacherDashboard: React.FC = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return;
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please login to access your dashboard.</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold">Welcome to your Teacher Dashboard, {user.name}!</h1>
      <Link href="/dashboard/create">
        <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
          Create a Challenge
        </button>
      </Link>
      <div className="mt-6 w-full max-w-4xl">
        {challenges.length > 0 ? (
          <ul className="space-y-4">
            {challenges.map((challenge) => (
              <li
                key={challenge.id}
                className="p-4 bg-white shadow-md rounded-md cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/challenges/${challenge.id}`)}
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
    </main>
  );
};

export default TeacherDashboard;
/**
 * page.tsx - Main home page of the Next.js application.
 *
 * This component displays a user management interface, fetching user data from an API
 * and rendering it dynamically with support for future CRUD operations.
 */

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CardComponent from '@/components/CardComponent';

// Define the structure of a user object
interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Home Component
 * Fetches and displays a list of users.
 *
 * Features:
 * - Fetches user data from an API using Axios.
 * - Displays users in cards with a delete button (future functionality).
 * - Designed with Tailwind CSS for a responsive and clean UI.
 */
export default function Home() {
  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // API URL fallback
  const [users, setUsers] = useState<User[]>([]); // State for managing users

  /**
   * useEffect Hook
   * Fetches user data when the component is mounted.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiURL}/users`);
        setUsers(response.data.reverse()); // Reverse to show newest users first
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [apiURL]);

  /**
   * JSX Structure
   * Renders a main section containing a list of user cards.
   */
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-center text-2xl font-bold text-gray-800">User Management App</h1>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
            >
              <CardComponent card={user} />
              <button className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Delete User
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

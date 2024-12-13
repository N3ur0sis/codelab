/**
 * page.tsx - Main home page of the Next.js application.
 *
 * This component displays a user management interface, fetching user data from an API
 * and rendering it dynamically with support for future CRUD operations.
 */

'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import CardComponent from "@/components/CardComponent";

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
  }, []);

  /**
   * JSX Structure
   * Renders a main section containing a list of user cards.
   */
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="space-y-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          User Management App
        </h1>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
            >
              <CardComponent card={user} />
              <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                Delete User
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
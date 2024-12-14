/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * page.tsx - Challenge Overview Page
 *
 * Handles the display of the challenge overview. If the user is not enrolled,
 * it shows the challenge details with a "Start Coding" button. If the user
 * is already enrolled, it redirects them to the instruction page for the challenge.
 */

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

// Backend API URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface Stage {
  id: number;
  title: string;
  description: string;
  order: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  stages: Stage[];
}

const ChallengePage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams(); // Fetch the dynamic route parameter
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  /**
   * Fetch challenge details and user's enrollment status.
   * If the user is already enrolled, redirect them to the instructions page.
   */
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/challenges/${id}`, {
          withCredentials: true, // Ensures cookies are included for authentication
        });

        setChallenge(data.challenge);
        setEnrolled(data.enrolled);

        // If enrolled, redirect directly to the instructions page
        if (data.enrolled) {
          router.push(`/challenges/${id}/instructions`);
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
      }
    };

    fetchChallenge();
  }, [id, router]);

  /**
   * Handle challenge enrollment.
   * Enrolls the user in the challenge and redirects them to the instructions page.
   */
  const handleEnroll = async () => {
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/challenges/enroll`,
        { challengeId: Number(id) },
        { withCredentials: true }
      );
      setEnrolled(true); // Update enrollment status
      router.push(`/challenges/${id}/instructions`); // Redirect to instructions page
    } catch (err) {
      console.error('Error enrolling in challenge:', err);
    }
  };

  if (!challenge) {
    return <p>Loading...</p>; // Loading state while challenge data is fetched
  }

  return (
    <div className="p-4">
      {/* Challenge Overview */}
      <h1 className="text-2xl font-bold">{challenge.title}</h1>
      <p className="mt-4">{challenge.description}</p>

      {/* Show "Start Coding" button if not enrolled */}
      {!enrolled && (
        <button
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={handleEnroll}
        >
          Start Coding
        </button>
      )}
    </div>
  );
};

export default ChallengePage;

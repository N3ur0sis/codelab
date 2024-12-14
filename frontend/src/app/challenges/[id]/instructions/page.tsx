/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * page.tsx - Challenge Instructions Page
 *
 * Displays the current stage of the challenge. The user sees instructions
 * on the left and a list of all stages on the right. The first stage is the
 * repository setup (pre-stage), followed by the actual stages from the database.
 */

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

// Backend API URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface Stage {
  status: string;
  id: number;
  title: string;
  description: string;
}

interface Enrollment {
  id: number;
  currentStage: number;
}

const InstructionsPage: React.FC = () => {
  const { id } = useParams(); // Fetch the dynamic route parameter
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [allStages, setAllStages] = useState<Stage[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  /**
   * Fetch the user's current stage and the list of all stages in the challenge.
   */
  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        // Fetch the current stage for the user
const { data: currentStageData } = await axios.get(
    `${BACKEND_URL}/challenges/${id}/current-stage`,
    { withCredentials: true }
  );
  setCurrentStage(currentStageData.stage);

        // Fetch all stages of the challenge
        const { data: challengeData } = await axios.get(`${BACKEND_URL}/challenges/${id}`, {
          withCredentials: true,
        });
        setAllStages(challengeData.challenge.stages);
      } catch (err) {
        console.error('Error fetching challenge instructions:', err);
      }
    };

    fetchInstructions();
  }, [id]);

  /**
   * Handle moving to the next stage in the challenge.
   * Updates the current stage in the backend and fetches the new instructions.
   */
  const handleNextStage = async () => {
    try {
      const { data: nextStageData } = await axios.post(
        `${BACKEND_URL}/challenges/${id}/next-stage`,
        { enrollmentId: enrollment?.id },
        { withCredentials: true }
      );
      setCurrentStage(nextStageData.stage); // Update the current stage
    } catch (err) {
      console.error('Error advancing to next stage:', err);
    }
  };

  if (!currentStage) {
    return <p>Loading...</p>; // Loading state while instructions are fetched
  }

  return (
    <div className="flex">
      {/* Sidebar for all stages */}
      <aside className="w-1/4 bg-gray-800 text-white p-4">
  <h2 className="text-xl font-bold">Stages</h2>
  <ul className="mt-4 space-y-2">
    {allStages.map((stage) => (
      <li
        key={stage.id}
        className={`p-2 rounded ${
          currentStage.id === stage.id
            ? "bg-blue-500"
            : stage.status === "completed"
            ? "bg-green-500"
            : "hover:bg-gray-700"
        }`}
      >
        {stage.title} - {stage.status === "completed" ? "Completed" : "In Progress"}
      </li>
    ))}
  </ul>
</aside>

      {/* Main content for current stage */}
      <main className="w-3/4 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold">{currentStage.title}</h1>
        <p className="mt-4">{currentStage.description}</p>
        <button
          onClick={handleNextStage}
          className="mt-6 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Continue
        </button>
      </main>
    </div>
  );
};

export default InstructionsPage;

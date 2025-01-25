'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface Stage {
  status: string;
  id: number;
  title: string;
  description: string;
}

const InstructionsPage: React.FC = () => {
  const { id } = useParams();
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [allStages, setAllStages] = useState<Stage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        console.log('Fetching current stage...');
        const { data: currentStageData } = await axios.get(
          `${BACKEND_URL}/challenges/${id}/current-stage`,
          { withCredentials: true }
        );
        setCurrentStage(currentStageData.stage);

        console.log('Fetching all stages...');
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

  // Restart validation listener when `currentStage` changes
  useEffect(() => {
    if (currentStage) {
      console.log(`Current stage changed to: ${currentStage.title}`);
      setIsListening(true);
      setCanContinue(false);
      listenForValidation();
    }
  }, [currentStage]);

  const listenForValidation = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current); // Clear existing interval

    intervalRef.current = setInterval(async () => {
      try {
        console.log('Polling for push and test validation...');
        const { data } = await axios.get(`${BACKEND_URL}/challenges/${id}/push-status`, {
          withCredentials: true,
        });

        if (data.pushValidated && data.testValidated) {
          console.log('Both push and test validated. Stopping polling.');
          if (intervalRef.current) clearInterval(intervalRef.current); // Stop polling
          setIsListening(false);
          setCanContinue(true);
        } else if (data.pushValidated && !data.testValidated) {
          console.log('Push validated. Waiting for test validation...');
        }
      } catch (err) {
        console.error('Error polling validation status:', err);
        if (intervalRef.current) clearInterval(intervalRef.current); // Stop polling on error
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleNextStage = async () => {
    try {
      const { data: nextStageData } = await axios.post(
        `${BACKEND_URL}/challenges/${id}/next-stage`,
        {},
        { withCredentials: true }
      );
      setCurrentStage(nextStageData.stage); // Triggers the useEffect for stage change
    } catch (err) {
      console.error('Error advancing to next stage:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // Cleanup interval on unmount
    };
  }, []);

  if (!currentStage) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex">
      <aside className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold">Stages</h2>
        <ul className="mt-4 space-y-2">
          {allStages.map((stage) => (
            <li
              key={stage.id}
              className={`p-2 rounded ${
                currentStage.id === stage.id
                  ? 'bg-blue-500'
                  : stage.status === 'completed'
                  ? 'bg-green-500'
                  : 'hover:bg-gray-700'
              }`}
            >
              {stage.title} - {stage.status === 'completed' ? 'Completed' : 'In Progress'}
            </li>
          ))}
        </ul>
      </aside>

      <main className="w-3/4 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold">{currentStage.title}</h1>
        <p className="mt-4">{currentStage.description}</p>

        {isListening && <p className="mt-4 text-yellow-500">Waiting for validation...</p>}
        {canContinue && (
          <button
            onClick={handleNextStage}
            className="mt-6 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            Continue
          </button>
        )}
      </main>
    </div>
  );
};

export default InstructionsPage;

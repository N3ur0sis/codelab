'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  authorId: string;
  stages: Stage[];
}

const ModifyChallengePage = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${BACKEND_URL}/challenges/${id}`, {
          withCredentials: true,
        });
        const data = response.data.challenge;  
        setChallenge(data);
        setTitle(data.title);
        setDescription(data.description);
        setStages(data.stages || []);  
      } catch (err) {
        console.error("Error fetching challenge:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  const handleUpdateChallenge = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
        // Check if the user is a teacher
        const responseAuth = await axios.get(`${BACKEND_URL}/auth/session`, { withCredentials: true });
        const userRole = responseAuth.data.user_role;  
        if (userRole !== 'TEACHER') {
          return;
        }

        await axios.put(
            `${BACKEND_URL}/challenges/${id}/modify`,
            { title, description, stages },
            { withCredentials: true }
        );
        router.push('/');
    } catch (err) {
      console.error("Error updating challenge:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = (index: number, field: 'title' | 'description', value: string) => {
    const updatedStages = [...stages];
    updatedStages[index][field] = value;
    setStages(updatedStages);
  };

  const addStage = () => {
    setStages([
      ...stages,
      { id: Date.now(), title: '', description: '', order: stages.length + 1 }
    ]);
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newStages.length) {
      [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
      setStages(newStages);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!challenge) {
    return <p>Challenge not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Modify Challenge</h1>

      {/* Challenge Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Challenge Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Stages */}
      <h2 className="text-lg font-bold mt-4">Stages</h2>
      {stages && stages.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {stages.map((stage, index) => (
            <li key={stage.id} className="p-3 border rounded flex justify-between items-center">
              <div className="w-1/2">
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={stage.title}
                  onChange={(e) => updateStage(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="w-1/2 ml-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={stage.description}
                  onChange={(e) => updateStage(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => moveStage(index, 'up')}
                  disabled={index === 0}
                  className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  ⬆
                </button>
                <button
                  onClick={() => moveStage(index, 'down')}
                  disabled={index === stages.length - 1}
                  className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  ⬇
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No stages added.</p>
      )}

      <button
        onClick={addStage}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Stage
      </button>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleUpdateChallenge}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Challenge"}
        </button>
      </div>
    </div>
  );
};

export default ModifyChallengePage;
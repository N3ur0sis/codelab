'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface Challenge {
  id: number;
  title: string;
  description: string;
  authorId: string;
}

const ModifyChallengePage = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
        const data = response.data;
        setChallenge(data);
        setTitle(data.title);
        setDescription(data.description);
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
        //Check if the user is a teacher
        const responseAuth = await axios.get(`${BACKEND_URL}/auth/session`, { withCredentials: true });
        const userRole = responseAuth.data.user_role;  
        if (userRole !== 'TEACHER') {return; }

        await axios.put(
            `${BACKEND_URL}/challenges/${challenge?.id}`,
            { title, description },
            { withCredentials: true }
        );
        router.push('/');
    } catch (err) {
      console.error("Error updating challenge:", err);
    } finally {
      setLoading(false);
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

      <div className="mb-4">
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleUpdateChallenge}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {loading ? "Updating..." : "Update Challenge"}
      </button>
    </div>
  );
};

export default ModifyChallengePage;
'use client';

import React, { useState } from 'react';

interface Stage {
  id: number;
  title: string;
  description: string;
}

const CreateChallengePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [stageTitle, setStageTitle] = useState('');
  const [stageDescription, setStageDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStages([]);
    setStageTitle('');
    setStageDescription('');
  };

  const addStage = () => {
    if (stageTitle.trim() && stageDescription.trim()) {
      setStages([...stages, { id: Date.now(), title: stageTitle, description: stageDescription }]);
      setStageTitle('');
      setStageDescription('');
    }
  };

  const removeStage = (id: number) => {
    setStages(stages.filter(stage => stage.id !== id));
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newStages.length) {
      [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
      setStages(newStages);
    }
  };

  const handleCreateChallenge = () => {
    console.log("Challenge ajouté !", { title, description, stages });
    // Tu pourras gérer l'ajout avec ton backend ici.
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Créer un Challenge</h1>

      {/* CHALLENGE FORM */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Titre</label>
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

      {/* ADD STAGE FORM */}
      <h2 className="text-lg font-bold mt-4">Ajouter une Étape</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium">Titre de l'étape</label>
        <input
          type="text"
          value={stageTitle}
          onChange={(e) => setStageTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Description de l'étape</label>
        <textarea
          value={stageDescription}
          onChange={(e) => setStageDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={addStage}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ajouter l'étape
      </button>

      {/* STAGE LIST */}
      <h2 className="text-lg font-bold mt-6">Étapes ajoutées</h2>
      {stages.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {stages.map((stage, index) => (
            <li key={stage.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{stage.title}</p>
                <p className="text-sm">{stage.description}</p>
              </div>
              <div className="flex space-x-2">
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
                <button
                  onClick={() => removeStage(stage.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  ✖
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Aucune étape ajoutée.</p>
      )}

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        <button
          onClick={resetForm}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Supprimer le challenge
        </button>
        <button
          onClick={handleCreateChallenge}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Ajouter le challenge
        </button>
      </div>
    </div>
  );
};

export default CreateChallengePage;
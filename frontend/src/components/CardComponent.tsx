/**
 * CardComponent.tsx - Reusable component for displaying user information.
 *
 * This component takes a `card` object as a prop and renders its details
 * in a styled card format. The component is designed for use in the user
 * management system.
 */

import React from 'react';

// Define the structure of a card object
interface Card {
  id: number;
  name: string;
  email: string;
}

/**
 * CardComponent
 * Props:
 * - card: Card - The card object containing user information (id, name, email).
 *
 * Features:
 * - Displays the user's ID, name, and email in a clean card format.
 * - Includes hover effects for improved UI responsiveness.
 */
const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="mb-2 rounded-lg bg-white p-2 shadow-lg hover:bg-gray-100">
      <h3 className="text-sm text-gray-600">{card.id}</h3>
      <h3 className="text-lg font-semibold text-gray-800">{card.name}</h3>
      <p className="text-md text-gray-700">{card.email}</p>
    </div>
  );
};

export default CardComponent;

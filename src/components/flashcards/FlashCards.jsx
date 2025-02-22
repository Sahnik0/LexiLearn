import React, { useState } from 'react';
import ObjectDetector from './ObjectDetector';
import FlashCardsContainer from './FlashCardsContainer';

const FlashCards = () => {
  const [activeTab, setActiveTab] = useState('cards');

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">Flash Cards</h1>
      
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'cards'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          FLASHCARDS
        </button>
        <button
          onClick={() => setActiveTab('cam')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'cam'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          NEW CARD
        </button>
      </div>

      {activeTab === "cards" ? <FlashCardsContainer /> : <ObjectDetector />}
    </div>
  );
};

export default FlashCards;